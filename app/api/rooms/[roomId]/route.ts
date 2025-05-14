import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	DeleteRoomParamsSchema,
	GetRoomParamsSchema,
	GetRoomSuccessResponse,
	UpdateRoomBodySchema,
} from '@/src/lib/schemas/room.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string }> }
) {
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = GetRoomParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '방 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const room = await prisma.room.findFirst({
			where: {
				id: paramsFields.data.roomId,
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
			include: {
				channel: {
					include: {
						message: {
							include: {
								profile: {
									select: {
										tag: true,
										name: true,
										image: true,
									},
								},
							},
							orderBy: {
								sentAt: 'desc',
							},
							take: 200,
						},
					},
				},
			},
		})

		if (!room) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 방입니다.',
				},
				{ status: 404 }
			)
		}

		return NextResponse.json<GetRoomSuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.message,
				data: room,
			},
			{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.status }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.code,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string }> }
) {
	const { roomId } = await params

	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = GetRoomParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '방 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const bodyFields = UpdateRoomBodySchema.safeParse(await params)

		if (!bodyFields.success) {
			const errorShape = bodyFields.error.format()

			const nameError = errorShape.name?._errors?.[0]
			const iconTypeError = errorShape.iconType?._errors?.[0]
			const iconDataError = errorShape.iconData?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (nameError) {
				message = 'name 의 형식이 잘못되었습니다.'
			} else if (iconTypeError) {
				message = 'iconType 의 형식이 잘못되었습니다.'
			} else if (iconDataError) {
				message = 'iconData 의 형식이 잘못되었습니다.'
			}

			return {
				response: {
					status: 'error',
					code: 0x0,
					message,
				},
				status: 400,
			}
		}

		const oldRoom = await prisma.room.findFirst({
			where: {
				id: roomId,
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
			select: {
				id: true,
				masterProfileId: true,
			},
		})

		if (!oldRoom) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '업데이트할 방의 정보가 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		if (oldRoom.masterProfileId === sessionCheck.profileId) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '방의 정보를 업데이트할 권한이 존재하지 않습니다.',
				},
				{ status: 403 }
			)
		}

		await prisma.room.update({
			where: {
				id: oldRoom.id,
			},
			data: {
				...bodyFields.data,
			},
		})

		const participantProfileIds = await prisma.roomParticipant.findMany({
			where: {
				roomId: oldRoom.id,
			},
			select: {
				profileId: true,
			},
		})

		socket.emit(
			'update_rooms',
			participantProfileIds.map(
				(participantProfileId) => participantProfileId.profileId
			)
		)

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방 정보가 업데이트 되었습니다.',
			},
			{ status: 201 }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.code,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string }> }
) {
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = DeleteRoomParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '방 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const room = await prisma.room.findFirst({
			select: {
				id: true,
				masterProfileId: true,
			},
			where: {
				id: paramsFields.data.roomId,
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
		})

		if (!room) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 방입니다.',
				},
				{ status: 404 }
			)
		}

		if (room.masterProfileId === sessionCheck.profileId) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '해당 방의 마스터가 아닙니다.',
				},
				{ status: 400 }
			)
		}

		const participantProfileIds = await prisma.roomParticipant.findMany({
			where: {
				roomId: room.id,
			},
			select: {
				profileId: true,
			},
		})

		await prisma.room.delete({
			where: {
				id: room.id,
			},
		})

		socket.emit(
			'update_rooms',
			participantProfileIds.map(
				(participantProfileId) => participantProfileId.profileId
			)
		)

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방이 삭제되었습니다.',
			},
			{ status: 204 }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.code,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

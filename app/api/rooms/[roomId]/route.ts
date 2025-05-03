import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ErrorResponse, RoomDetail, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
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

		const room = await prisma.room.findFirst({
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
			include: {
				message: {
					where: {
						sentAt: {
							gte: new Date(new Date().setDate(new Date().getDate() - 7)),
						},
					},
					include: {
						profile: {
							select: {
								tag: true,
								name: true,
								image: true,
							},
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

		return NextResponse.json<SuccessResponse<RoomDetail>>(
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
	const {
		name,
		iconType,
		iconData,
	}: {
		name?: string
		iconType?: 'text' | 'image'
		iconData?: string
	} = await request.json()

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

		if (name && typeof name !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. name 을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (iconType && iconType !== 'text' && iconType !== 'image') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. iconType 을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (iconData && typeof iconData !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. iconData 을 다시 확인하세요',
				},
				{ status: 400 }
			)
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
				name,
				iconType,
				iconData,
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

		const room = await prisma.room.findFirst({
			select: {
				id: true,
				masterProfileId: true,
			},
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

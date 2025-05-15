import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import { DeleteRoomParticipantParamsSchema } from '@/src/lib/schemas/room.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string; profileId: string }> }
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

		const paramsFields = DeleteRoomParticipantParamsSchema.safeParse(
			await params
		)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const romIdError = errorShape.roomId?._errors?.[0]
			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (romIdError) {
				message = 'romIdE의  형식이 잘못되었습니다.'
			} else if (profileIdError) {
				message = 'profileId의 형식이 잘못되었습니다.'
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message,
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

		if (
			room.masterProfileId === sessionCheck.profileId &&
			paramsFields.data.profileId !== sessionCheck.profileId
		) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '해당 방의 마스터가 아닙니다.',
				},
				{ status: 403 }
			)
		}

		const roomParticipant = await prisma.roomParticipant.findFirst({
			where: {
				roomId: room.id,
				profileId: paramsFields.data.profileId,
			},
			select: {
				id: true,
			},
		})

		if (!roomParticipant) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '해당 방의 참여자가 아닙니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.roomParticipant.delete({
			where: {
				id: roomParticipant.id,
			},
		})

		socket.emit('update_rooms', [paramsFields.data.profileId])

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 참여자가 방에서 삭제되었습니다.',
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

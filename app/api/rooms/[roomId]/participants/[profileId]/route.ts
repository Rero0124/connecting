import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
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

		const { roomId, profileId } = await params
		const numberProfileId = Number(profileId)

		if (isNaN(numberProfileId)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '프로필 아이디의 형식이 잘못되었습니다.',
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

		if (
			room.masterProfileId === sessionCheck.profileId &&
			numberProfileId !== sessionCheck.profileId
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
				profileId: numberProfileId,
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

		socket.emit('update_rooms', [numberProfileId])

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

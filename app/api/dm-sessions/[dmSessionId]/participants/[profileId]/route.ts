import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string; profileId: string }> }
) {
	try {
		const { dmSessionId, profileId } = await params
		const numberProfileId = Number(profileId)
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

		const dmSession = await prisma.dmSession.findFirst({
			select: {
				id: true,
			},
			where: {
				id: dmSessionId,
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

		if (!dmSession) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 DM입니다.',
				},
				{ status: 404 }
			)
		}

		const dmParticipant = await prisma.dmParticipant.findFirst({
			where: {
				dmSessionId: dmSession.id,
				profileId: numberProfileId,
			},
			select: {
				id: true,
			},
		})

		if (!dmParticipant) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '해당 DM의 참여자가 아닙니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.dmParticipant.delete({
			where: {
				id: dmParticipant.id,
			},
		})

		const dmParticipantCnt = await prisma.dmParticipant.count({
			where: {
				dmSessionId: dmSession.id,
			},
		})

		if (dmParticipantCnt < 1) {
			await prisma.dmSession.delete({
				where: {
					id: dmSession.id,
				},
			})
		}

		socket.emit('update_dmSessions', [numberProfileId])

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 참여자가 DM에서 삭제되었습니다.',
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

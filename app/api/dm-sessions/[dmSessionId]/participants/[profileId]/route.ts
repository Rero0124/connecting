import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import { DeleteDmParticipantParamsSchema } from '@/src/lib/schemas/dm.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string; profileId: string }> }
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

		const paramsFields = DeleteDmParticipantParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const dmSessionIdError = errorShape.dmSessionId?._errors?.[0]
			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (dmSessionIdError) {
				message = 'dmSessionId의 형식이 잘못되었습니다.'
			} else if (profileIdError) {
				message = 'profileId의 형식이 잘못되었습니다.'
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

		const dmSession = await prisma.dmSession.findFirst({
			select: {
				id: true,
			},
			where: {
				id: paramsFields.data.dmSessionId,
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
				profileId: paramsFields.data.profileId,
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

		socket.emit('update_dmSessions', [paramsFields.data.profileId])

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

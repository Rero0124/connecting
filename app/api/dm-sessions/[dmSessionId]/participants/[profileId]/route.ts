import {
	RESPONSE_CODE,
	RESPONSE_CODE_DM_DELETE_DM_PARTICIPANT_PARAMS,
} from '@/src/lib/constants/responseCode'
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
					code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_SESSION_INVALID,
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
			let code: RESPONSE_CODE_DM_DELETE_DM_PARTICIPANT_PARAMS =
				RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_PARAMS_INVALID

			if (dmSessionIdError) {
				message = 'dmSessionId 의 형식이 잘못되었습니다.'
				code =
					RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_PARAMS_INVALID_DM_SESSION_ID
			} else if (profileIdError) {
				message = 'profileId 의 형식이 잘못되었습니다.'
				code = RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_PARAMS_INVALID_PROFILE_ID
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code,
					message,
				},
				{ status: 400 }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			select: {
				id: true,
			},
			where: {
				id: paramsFields.data.dmSessionId,
			},
		})

		if (!dmSession) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_DM_SESSION_NOT_FOUND,
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
					code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_DM_SESSION_NOT_JOIN,
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
				code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_SUCCESS,
				message: '해당 참여자가 DM에서 삭제되었습니다.',
			},
			{ status: 204 }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

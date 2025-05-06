import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateDmMessageBodySchema,
	CreateDmMessageParamsSchema,
} from '@/src/lib/schemas/dm.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string }> }
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

		const paramsFields = CreateDmMessageParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: 'DM 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const bodyFields = CreateDmMessageBodySchema.safeParse(await request.json())

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. message 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			where: {
				id: paramsFields.data.dmSessionId,
			},
			select: {
				id: true,
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

		const participantProfileIds = await prisma.dmParticipant.findMany({
			where: {
				dmSessionId: dmSession.id,
			},
			select: {
				profileId: true,
			},
		})

		if (
			participantProfileIds.indexOf({
				profileId: sessionCheck.profileId,
			}) > -1
		) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: 'DM에 참여중이 아닙니다.',
				},
				{ status: 404 }
			)
		}

		const dmMessage = await prisma.dmMessage.create({
			data: {
				content: bodyFields.data.message,
				dmSessionId: dmSession.id,
				profileId: sessionCheck.profileId,
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
		})

		socket.emit(
			'send_dmMessage',
			dmMessage,
			participantProfileIds.map(
				(participantProfileId) => participantProfileId.profileId
			)
		)

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: 'DM에 메세지를 전송하였습니다.',
			},
			{ status: 200 }
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

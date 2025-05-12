import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateRoomMessageBodySchema,
	CreateRoomMessageParamsSchema,
} from '@/src/lib/schemas/room.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string; channelId: string }> }
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

		const paramsFields = CreateRoomMessageParamsSchema.safeParse(await params)

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

		const bodyFields = CreateRoomMessageBodySchema.safeParse(
			await request.json()
		)

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

		const room = await prisma.room.findFirst({
			where: {
				id: paramsFields.data.roomId,
			},
			select: {
				id: true,
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

		const participantProfileIds = await prisma.roomParticipant.findMany({
			where: {
				roomId: room.id,
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
					message: '방에 참여중이 아닙니다.',
				},
				{ status: 404 }
			)
		}

		const roomMessage = await prisma.roomMessage.create({
			data: {
				content: bodyFields.data.message,
				roomId: room.id,
				roomChannelId: paramsFields.data.channelId,
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
			'send_roomMessage',
			roomMessage,
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

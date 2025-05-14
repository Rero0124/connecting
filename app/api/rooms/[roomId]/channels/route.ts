import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateRoomBodySchema,
	CreateRoomChannelBodySchema,
	CreateRoomChannelParamsSchema,
	GetRoomChannelsParamsSchema,
	GetRoomChannelsSuccessResponse,
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

		const paramsFields = GetRoomChannelsParamsSchema.safeParse(await params)

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

		const roomChannels = await prisma.roomChannel.findMany({
			where: {
				roomId: paramsFields.data.roomId,
				room: {
					participant: {
						some: {
							profile: {
								id: sessionCheck.profileId,
								userId: sessionCheck.userId,
							},
						},
					},
				},
			},
		})

		return NextResponse.json<GetRoomChannelsSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방의 채널 리스트를 조회하였습니다.',
				data: roomChannels,
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

export async function POST(
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

		const paramsFields = CreateRoomChannelParamsSchema.safeParse(await params)

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

		const bodyFields = CreateRoomChannelBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. name, type 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const participantProfileIds = await prisma.roomParticipant.findMany({
			where: {
				roomId: paramsFields.data.roomId,
			},
			select: {
				profileId: true,
			},
		})

		await prisma.roomChannel.create({
			data: {
				name: bodyFields.data.name,
				type: bodyFields.data.type,
				roomId: paramsFields.data.roomId,
			},
		})

		socket.emit(
			'update_roomChannels',
			participantProfileIds.map(
				(participantProfileId) => participantProfileId.profileId
			),
			paramsFields.data.roomId
		)

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_ROOM_CREATE_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_ROOM_CREATE_SUCCESS.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_ROOM_CREATE_SUCCESS.status }
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

import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateRoomParticipantBodySchema,
	CreateRoomParticipantParamsSchema,
	GetRoomParticipantsParamsSchema,
	GetRoomParticipantsSuccessResponse,
} from '@/src/lib/schemas/room.schema'
import { apiJsonResponse } from '@/src/lib/serverUtil'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { type NextRequest } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string }> }
) {
	try {
		const sessionCheck = await verifySession()

		if (!sessionCheck.isAuth) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = GetRoomParticipantsParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return apiJsonResponse<ErrorResponse>(
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
			select: {
				id: true,
			},
		})

		if (!room) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 방입니다.',
				},
				{ status: 404 }
			)
		}

		const roomParticipants = await prisma.roomParticipant.findMany({
			where: {
				roomId: room.id,
			},
		})

		return apiJsonResponse<GetRoomParticipantsSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방의 참여자들을 조회하였습니다.',
				data: roomParticipants,
			},
			{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.status }
		)
	} catch {
		return apiJsonResponse<ErrorResponse>(
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
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = CreateRoomParticipantParamsSchema.safeParse(
			await params
		)

		if (!paramsFields.success) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '방 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const bodyFields = CreateRoomParticipantBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. joinCode 를 다시 확인하세요',
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
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 방입니다.',
				},
				{ status: 404 }
			)
		}

		const roomJoinCode = await prisma.roomJoinCode.findFirst({
			where: {
				roomId: room.id,
				code: bodyFields.data.joinCode,
			},
			select: {
				id: true,
				expiresAt: true,
			},
		})

		if (!roomJoinCode) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 방 초대 코드입니다.',
				},
				{ status: 404 }
			)
		}

		if (roomJoinCode.expiresAt < new Date()) {
			await prisma.roomJoinCode.delete({
				where: {
					id: roomJoinCode.id,
				},
			})

			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '만료된 방 초대 코드입니다.',
				},
				{ status: 404 }
			)
		}

		const isRoomParticipant = await prisma.roomParticipant.count({
			where: {
				roomId: room.id,
				profileId: sessionCheck.profileId,
			},
		})

		if (isRoomParticipant > 0) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '이미 해당 방의 참여자입니다.',
				},
				{ status: 400 }
			)
		}

		await prisma.roomParticipant.create({
			data: {
				roomId: room.id,
				profileId: sessionCheck.profileId,
			},
		})

		socket.emit('update_rooms', [sessionCheck.profileId])

		return apiJsonResponse<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방에 참여하였습니다.',
			},
			{ status: 200 }
		)
	} catch {
		return apiJsonResponse<ErrorResponse>(
			{
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.code,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

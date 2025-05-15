import prisma from '@/src/lib/prisma'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateRoomJoinCodeBodySchema,
	CreateRoomJoinCodeParamsSchema,
	CreateRoomJoinCodeSuccessResponse,
	GetRoomJoinCodesParamsSchema,
	GetRoomJoinCodesSuccessResponse,
} from '@/src/lib/schemas/room.schema'
import { verifySession } from '@/src/lib/session'
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

		const paramsFields = GetRoomJoinCodesParamsSchema.safeParse(await params)

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

		const room = await prisma.room.findFirst({
			where: {
				id: paramsFields.data.roomId,
			},
			select: {
				id: true,
				masterProfileId: true,
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

		const roomJoinCodes = await prisma.roomJoinCode.findMany({
			where: {
				roomId: room.id,
			},
		})

		return NextResponse.json<GetRoomJoinCodesSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방의 참여코드들을 조회하였습니다.',
				data: roomJoinCodes,
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

		const paramsFields = CreateRoomJoinCodeParamsSchema.safeParse(await params)

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

		const bodyFields = CreateRoomJoinCodeBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. expiresAt 를 다시 확인하세요',
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
				masterProfileId: true,
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

		const roomJoinCode = await prisma.roomJoinCode.create({
			data: {
				roomId: room.id,
				authorProfileId: sessionCheck.profileId,
				expiresAt: bodyFields.data.expiresAt,
			},
		})

		return NextResponse.json<CreateRoomJoinCodeSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방의 초대코드를 생성했습니다.',
				data: roomJoinCode,
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

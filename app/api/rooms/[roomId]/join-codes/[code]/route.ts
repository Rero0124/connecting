import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import { DeleteRoomJoinCodeParamsSchema } from '@/src/lib/schemas/room.schema'
import { verifySession } from '@/src/lib/session'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ roomId: string; code: string }> }
) {
	try {
		const { roomId, code } = await params
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

		const paramsFields = DeleteRoomJoinCodeParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const roomIdError = errorShape.roomId?._errors?.[0]
			const codeError = errorShape.code?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (roomIdError) {
				message = 'roomId의 형식이 잘못되었습니다.'
			} else if (codeError) {
				message = 'code의 형식이 잘못되었습니다.'
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
			where: {
				id: roomId,
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

		const roomJoinCode = await prisma.roomJoinCode.findFirst({
			where: {
				code: code,
				roomId: roomId,
			},
			select: {
				id: true,
			},
		})

		if (!roomJoinCode) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 참여코드입니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.roomJoinCode.delete({
			where: {
				id: roomJoinCode.id,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '방의 초대코드를 삭제했습니다.',
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

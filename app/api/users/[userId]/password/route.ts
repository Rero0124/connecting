import prisma from '@/src/lib/prisma'
import bcryptjs from 'bcryptjs'
import { NextResponse, type NextRequest } from 'next/server'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'
import {
	UpdateUserPasswordBodySchema,
	UpdateUserPasswordParamsSchema,
} from '@/src/lib/schemas/user.schema'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const paramsFields = UpdateUserPasswordParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return {
				response: {
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				status: 400,
			}
		}

		const data = await verifyUserIdInSession(paramsFields.data.userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		const bodyFields = UpdateUserPasswordBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. password를를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const hashedPassword = await bcryptjs.hash(bodyFields.data.password, 10)

		await prisma.user.update({
			where: {
				id: data.response.data.userId,
			},
			data: {
				password: hashedPassword,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_USER_UPDATE_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_USER_UPDATE_SUCCESS.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_USER_UPDATE_SUCCESS.status }
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

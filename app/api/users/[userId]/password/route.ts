import prisma from '@/src/lib/prisma'
import bcryptjs from 'bcryptjs'
import { NextResponse, type NextRequest } from 'next/server'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const userId = (await params).userId
	try {
		const { password } = await request.json()

		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		if (typeof password !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. password를를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const hashedPassword = await bcryptjs.hash(password, 10)

		await prisma.user.update({
			where: {
				id: data.response.data?.userId,
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

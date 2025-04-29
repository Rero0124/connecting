import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { deleteSession, verifySession } from '@/src/lib/session'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const userId = Number((await params).userId)
	try {
		const body = await request.json()

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

		if (isNaN(userId)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		if (sessionCheck.userId !== userId) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '현재 로그인된 사용자와 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		if (!body || !(body.email && typeof body.email === 'string')) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. email을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const email: string = body.email

		await prisma.user.update({
			where: {
				id: sessionCheck.userId,
			},
			data: {
				email: email,
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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const userId = Number((await params).userId)
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

		if (isNaN(userId)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		if (sessionCheck.userId !== userId) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '현재 로그인된 사용자와 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		await prisma.user.delete({
			where: {
				id: sessionCheck.userId,
			},
		})

		await deleteSession()

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_USER_DELETE_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_USER_DELETE_SUCCESS.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_USER_DELETE_SUCCESS.status }
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

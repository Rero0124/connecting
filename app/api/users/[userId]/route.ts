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
		const rawData: {
			tag: string
			name: string
			email: string
		} = await request.json()

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
		const rawData: {
			tag: string
			name: string
			email: string
		} = await request.json()

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
				code: 0x0,
				message: '회원탈퇴가 완료되었습니다.',
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

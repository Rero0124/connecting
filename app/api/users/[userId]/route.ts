import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { deleteSession, verifySession } from '@/src/lib/session'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params
		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		return NextResponse.json<SuccessResponse>(
			{
				...data.response,
			},
			{ status: data.status }
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params
		const { email }: { email?: string } = await request.json()
		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		if (typeof email !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. email을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		await prisma.user.update({
			where: {
				id: data.response.data?.userId,
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
	try {
		const { userId } = await params
		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		await prisma.user.delete({
			where: {
				id: data.response.data?.userId,
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

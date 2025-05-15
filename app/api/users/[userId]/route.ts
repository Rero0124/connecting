import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { deleteSession } from '@/src/lib/session'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'
import {
	GetUserParamsSchema,
	GetUserSuccessResponse,
	UpdateUserBodySchema,
	UpdateUserParamsSchema,
} from '@/src/lib/schemas/user.schema'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const paramsFields = GetUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
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

		return NextResponse.json<GetUserSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '사용자의 상세정보를 조회하였습니다.',
				data: data.response.data,
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const paramsFields = UpdateUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
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

		const bodyFields = UpdateUserBodySchema.safeParse(await request.json())

		if (!bodyFields.success) {
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
				id: data.response.data.userId,
			},
			data: {
				email: bodyFields.data.email,
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
		const paramsFields = GetUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '유저 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
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

		await prisma.user.delete({
			where: {
				id: data.response.data.userId,
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

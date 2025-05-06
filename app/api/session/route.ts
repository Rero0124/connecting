import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { createSession, deleteSession, verifySession } from '@/src/lib/session'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import {
	GetSessionSuccessResponse,
	VerifySessionSuccessResponse,
} from '@/src/lib/schemas/session.schema'
import {
	AuthChangeProfileBodySchema,
	AuthLoginBodySchema,
} from '@/src/lib/schemas/auth.schema'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'

export async function GET(request: NextRequest) {
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

		return NextResponse.json<GetSessionSuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.message,
				data: sessionCheck,
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

export async function POST(request: NextRequest) {
	try {
		const loginFields = AuthLoginBodySchema.safeParse(await request.json())

		if (!loginFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.status }
			)
		}

		const { email, password, profileId } = loginFields.data

		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '이메일 또는 비밀번호가 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		if (!bcryptjs.compareSync(password, user.password)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '이메일 또는 비밀번호가 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.findFirst({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		})

		if (!profile) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '프로필이 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		await createSession(user.id, profile.id)

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

		return NextResponse.json<VerifySessionSuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.message,
				data: sessionCheck,
			},
			{ status: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.status }
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

export async function PATCH(request: NextRequest) {
	try {
		const bodyFields = AuthChangeProfileBodySchema.safeParse(
			await request.json()
		)
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

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. profileId 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const userProfile = await prisma.profile.findFirst({
			where: {
				id: bodyFields.data.profileId,
				userId: sessionCheck.userId,
			},
		})

		if (!userProfile) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_FAILED.code,
					message:
						ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_FAILED.message,
				},
				{
					status:
						ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_FAILED.status,
				}
			)
		}

		await createSession(userProfile.userId, userProfile.id)
		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_SUCCESS.code,
				message:
					ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_SUCCESS.message,
			},
			{
				status: ResponseDictionary.kr.RESPONSE_AUTH_USER_PROFILE_SUCCESS.status,
			}
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

export async function DELETE() {
	try {
		await deleteSession()
		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_LOGOUT_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_LOGOUT_SUCCESS.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_LOGOUT_SUCCESS.status }
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

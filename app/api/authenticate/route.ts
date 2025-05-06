import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import {
	AuthGetProfilesBodySchema,
	AuthGetProfilesSuccessResponse,
} from '@/src/lib/schemas/auth.schema'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'
import {
	RESPONSE_CODE,
	RESPONSE_CODE_AUTH_GET_PROFILES_BODY_INVALID,
} from '@/src/lib/constants/responseCode'

export async function POST(request: NextRequest) {
	try {
		const bodyFields = AuthGetProfilesBodySchema.safeParse(await request.json())

		if (!bodyFields.success) {
			const errorShape = bodyFields.error.format()

			const emailError = errorShape.email?._errors?.[0]
			const passwordError = errorShape.password?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'
			let code: RESPONSE_CODE_AUTH_GET_PROFILES_BODY_INVALID =
				RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID

			if (emailError) {
				message = 'email의 형식이 잘못되었습니다.'
				code = RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID_EMAIL
			} else if (passwordError) {
				message = 'profileId의 형식이 잘못되었습니다.'
				code = RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID_PASSWORD
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code,
					message,
				},
				{ status: 400 }
			)
		}

		const { email, password } = bodyFields.data

		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.AUTH.GET_PROFILES_UNMATCH_USER,
					message: '이메일 또는 비밀번호가 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		if (!bcryptjs.compareSync(password, user.password)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.AUTH.GET_PROFILES_UNMATCH_USER,
					message: '이메일 또는 비밀번호가 일치하지 않습니다.',
				},
				{ status: 400 }
			)
		}

		const profiles = await prisma.profile.findMany({
			omit: {
				userId: true,
			},
			where: {
				user: {
					email,
				},
			},
		})

		return NextResponse.json<AuthGetProfilesSuccessResponse>(
			{
				status: 'success',
				code: RESPONSE_CODE.AUTH.GET_PROFILES_SUCCESS,
				message: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.message,
				data: profiles,
			},
			{ status: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.status }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import {
	AuthGetProfilesBodySchema,
	AuthGetProfilesSuccessResponse,
} from '@/src/lib/schemas/auth.schema'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'

export async function POST(request: NextRequest) {
	try {
		const bodyFields = AuthGetProfilesBodySchema.safeParse(await request.json())

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_LOGIN_FAILED.status }
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
				code: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_LOGIN_SUCCESS.message,
				data: profiles,
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

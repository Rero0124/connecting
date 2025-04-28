import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { JoinFormSchema } from '@/src/lib/definitions'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'

export async function POST(request: NextRequest) {
	let user
	try {
		const rawData = await request.json()
		const validatedFields = JoinFormSchema.safeParse({
			tag: rawData.tag,
			name: rawData.name,
			email: rawData.email,
			password: rawData.password,
		})

		if (!validatedFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message:
						'입력값이 잘못되었습니다. tag, name, email, password를 다시 확인해주세요.',
				},
				{ status: 400 }
			)
		}

		const { tag, name, email, password } = validatedFields.data!

		const hashedPassword = await bcryptjs.hash(password, 10)

		user = await prisma.user.create({
			data: { email, password: hashedPassword },
		})

		await prisma.userProfile.create({
			data: {
				userTag: tag,
				userId: user.id,
				userName: name,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_JOIN_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_JOIN_SUCCESS.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_JOIN_SUCCESS.status }
		)
	} catch {
		if (user) {
			await prisma.user.delete({
				where: {
					id: user.id,
				},
			})
		}

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

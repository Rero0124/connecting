import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateProfileByUserBodySchema,
	CreateProfileByUserParamsSchema,
	GetProfilesByUserParamsSchema,
	GetProfilesByUserSuccessResponse,
} from '@/src/lib/schemas/profile.schema'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const paramsFields = GetProfilesByUserParamsSchema.safeParse(await params)

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

		const profiles = await prisma.profile.findMany({
			omit: {
				userId: true,
			},
			where: {
				userId: data.response.data?.userId,
			},
		})

		return NextResponse.json<GetProfilesByUserSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 유저의 전체 프로필을 조회하였습니다.',
				data: profiles,
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

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const paramsFields = CreateProfileByUserParamsSchema.safeParse(await params)

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

		const bodyFields = CreateProfileByUserBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message:
						'인자가 잘못되었습니다. name, tag, image, information, statusType, statusId를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		await prisma.profile.create({
			data: {
				userId: data.response.data.userId,
				...bodyFields.data,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 유저의 프로필을 생성하였습니다.',
			},
			{ status: 201 }
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

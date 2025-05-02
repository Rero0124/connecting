import prisma from '@/src/lib/prisma'
import { verifyUserIdInSession } from '@/src/lib/serverUtil'
import {
	ErrorResponse,
	ProfileDetail,
	ProfileList,
	SuccessResponse,
} from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextResponse, type NextRequest } from 'next/server'

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

		const profiles = await prisma.profile.findMany({
			where: {
				userId: data.response.data?.userId,
			},
		})

		return NextResponse.json<SuccessResponse<ProfileList>>(
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
		const { userId } = await params
		const {
			name,
			tag,
			image,
			information,
			statusType,
			statusId,
		}: {
			name?: string
			tag?: string
			image?: string
			information?: string
			statusType?: 'common' | 'custom'
			statusId?: number
		} = await request.json()
		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		if (
			typeof name !== 'string' ||
			typeof tag !== 'string' ||
			typeof image !== 'string' ||
			typeof information !== 'string' ||
			typeof statusType !== 'string' ||
			statusType === 'common' ||
			statusType === 'custom' ||
			typeof statusId !== 'number'
		) {
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

		const profile = await prisma.profile.create({
			data: {
				userId: data.response.data!.userId,
				name: name,
				tag: tag,
				image: image,
				information: information,
				statusType: statusType,
				statusId: statusId,
			},
		})

		return NextResponse.json<SuccessResponse<ProfileDetail>>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 유저의 프로필을 생성하였습니다.',
				data: profile,
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

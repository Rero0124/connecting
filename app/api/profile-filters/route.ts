import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import {
	ErrorResponse,
	FilterProfileList,
	SuccessResponse,
} from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession()
		if (sessionCheck.authType !== 'profile') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const profileFilters = await prisma.profileFilter.findMany({
			where: {
				byProfile: {
					id: sessionCheck.profileId,
					userId: sessionCheck.userId,
				},
			},
			include: {
				profile: {
					select: {
						image: true,
						createdAt: true,
						name: true,
						tag: true,
						statusType: true,
						statusId: true,
						isOnline: true,
					},
				},
			},
		})

		return NextResponse.json<SuccessResponse<FilterProfileList>>(
			{
				status: 'success',
				code: 0x0,
				message: '사용자 필터링 목록을 조회하였습니다.',
				data: profileFilters,
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

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const sessionCheck = await verifySession()

		if (sessionCheck.authType !== 'profile') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		if (
			!body ||
			!(body.profileId && typeof body.profileId === 'number') ||
			!(body.filterType && typeof body.filterType === 'string')
		) {
			return NextResponse.json<SuccessResponse>(
				{
					status: 'success',
					code: 0x0,
					message:
						'인자가 올바르지 않습니다. profileId, filterType 를 다시 확인해주세요.',
				},
				{ status: 400 }
			)
		}

		const {
			profileId,
			filterType,
		}: {
			profileId: number
			filterType: string
		} = body

		await prisma.profileFilter.create({
			data: {
				profileId: sessionCheck.profileId,
				filterProfileId: profileId,
				filterType: filterType,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '사용자 필터를 추가하였습니다.',
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

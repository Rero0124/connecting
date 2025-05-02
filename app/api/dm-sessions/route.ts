import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
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

		const allowedDmSessions = await prisma.dmSession.findMany({
			where: {
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
						isNotAllowed: false,
					},
				},
			},
		})

		const notAllowedDmSessions = await prisma.dmSession.findMany({
			where: {
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
						isNotAllowed: true,
					},
				},
			},
		})

		return NextResponse.json<
			SuccessResponse<{
				allowedDmSessions: {
					name: string
					id: string
					iconType: string
					iconData: string
					createdAt: Date
				}[]
				notAllowedDmSessions: {
					name: string
					id: string
					iconType: string
					iconData: string
					createdAt: Date
				}[]
			}>
		>(
			{
				status: 'success',
				code: 0x0,
				message: 'DM 목록을 조회하였습니다.',
				data: {
					allowedDmSessions,
					notAllowedDmSessions,
				},
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
		const {
			name,
			iconType,
			iconData,
		}: {
			name?: string
			iconType?: 'text' | 'image'
			iconData?: string
		} = await request.json()
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
			typeof name !== 'string' ||
			!(iconType === 'text' || iconType === 'image') ||
			typeof iconData !== 'string'
		) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message:
						'인자가 잘못되었습니다. name, iconType, iconData를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		await prisma.dmSession.create({
			data: {
				name: name,
				iconType: iconType,
				iconData: iconData,
				participant: {
					create: {
						profileId: sessionCheck.profileId,
					},
				},
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: 'DM이 생성되었습니다.',
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

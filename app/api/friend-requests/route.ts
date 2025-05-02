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

		const rawReceivedfriendRequests = await prisma.friendRequest.findMany({
			where: {
				byProfile: {
					id: sessionCheck.profileId,
					userId: sessionCheck.userId,
				},
			},
			include: {
				requestProfile: {
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

		const rawSentfriendRequests = await prisma.friendRequest.findMany({
			where: {
				requestProfile: {
					id: sessionCheck.profileId,
					userId: sessionCheck.userId,
				},
			},
			include: {
				byProfile: {
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

		const receivedfriendRequests = rawReceivedfriendRequests.map(
			(friendRequest) => ({
				id: friendRequest.id,
				sentAt: friendRequest.sentAt,
				profileId: friendRequest.requestProfileId,
				profile: friendRequest.requestProfile,
			})
		)

		const sentfriendRequests = rawSentfriendRequests.map((friendRequest) => ({
			id: friendRequest.id,
			sentAt: friendRequest.sentAt,
			profileId: friendRequest.requestProfileId,
			profile: friendRequest.byProfile,
		}))

		return NextResponse.json<
			SuccessResponse<{
				receivedfriendRequests: {
					profile: {
						statusType: string
						statusId: number
						tag: string
						name: string | null
						image: string
						isOnline: boolean
						createdAt: Date
					}
					id: number
					sentAt: Date
				}[]
				sentfriendRequests: {
					profile: {
						name: string | null
						image: string
						statusType: string
						statusId: number
						tag: string
						isOnline: boolean
						createdAt: Date
					}
					id: number
					sentAt: Date
				}[]
			}>
		>(
			{
				status: 'success',
				code: 0x0,
				message: '친구신청 목록을 조회하였습니다.',
				data: {
					receivedfriendRequests,
					sentfriendRequests,
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
		const { tag } = await request.json()
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

		if (typeof tag !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 올바르지 않습니다. tag 를 다시 확인해주세요.',
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.findUnique({
			where: {
				tag: tag,
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
					message: '해당하는 유저가 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.friendRequest.create({
			data: {
				profileId: profile.id,
				requestProfileId: sessionCheck.profileId,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '친구신청을 하였습니다.',
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

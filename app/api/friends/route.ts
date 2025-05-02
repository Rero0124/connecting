import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { ErrorResponse, FriendList, SuccessResponse } from '@/src/types/api'
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

		const friends = await prisma.profile.findMany({
			select: {
				image: true,
				createdAt: true,
				tag: true,
				name: true,
				statusType: true,
				statusId: true,
				isOnline: true,
			},
			where: {
				friendProfile: {
					some: {
						byProfile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
		})

		return NextResponse.json<SuccessResponse<FriendList>>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.message,
				data: friends,
			},
			{ status: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.status }
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

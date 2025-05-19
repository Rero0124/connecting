import prisma from '@/src/lib/prisma'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'
import { GetFriendsSuccessResponse } from '@/src/lib/schemas/friend.schema'
import { apiJsonResponse } from '@/src/lib/serverUtil'
import { verifySession } from '@/src/lib/session'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return apiJsonResponse<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const friends = await prisma.profile.findMany({
			omit: {
				userId: true,
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

		return apiJsonResponse<GetFriendsSuccessResponse>(
			{
				status: 'success',
				code: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.code,
				message: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.message,
				data: friends,
			},
			{ status: ResponseDictionary.kr.RESPONSE_FRIEND_LIST_SUCCESS.status }
		)
	} catch {
		return apiJsonResponse<ErrorResponse>(
			{
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.code,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import {
	DmSessionDetail,
	ErrorResponse,
	SuccessResponse,
} from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string }> }
) {
	const { dmSessionId } = await params
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			where: {
				id: dmSessionId,
				participant: {
					some: {
						profile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
			include: {
				message: {
					where: {
						sentAt: {
							gte: new Date(new Date().setDate(new Date().getDate() - 7)),
						},
					},
					include: {
						profile: {
							select: {
								tag: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		})

		if (!dmSession) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '존재하지 않는 DM입니다.',
				},
				{ status: 404 }
			)
		}

		return NextResponse.json<SuccessResponse<DmSessionDetail>>(
			{
				status: 'success',
				code: 0x0,
				message: 'DM 상세정보를 가져왔습니다.',
				data: dmSession,
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

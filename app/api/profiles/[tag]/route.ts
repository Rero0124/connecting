import prisma from '@/src/lib/prisma'
import { ErrorResponse, ProfileDetail, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ tag: string }> }
) {
	try {
		const { tag } = await params

		const profile = await prisma.profile.findFirst({
			select: {
				image: true,
				createdAt: true,
				name: true,
				tag: true,
				statusType: true,
				statusId: true,
				isOnline: true,
				information: true,
				isCompany: true,
			},
			where: {
				tag: tag,
			},
		})

		if (!profile) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '프로필 정보가 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		return NextResponse.json<SuccessResponse<ProfileDetail>>(
			{
				status: 'success',
				code: 0x0,
				message: '프로필 상세정보를 조회하였습니다.',
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

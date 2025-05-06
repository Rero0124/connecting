import prisma from '@/src/lib/prisma'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'
import { GetProfilesSuccessResponse } from '@/src/lib/schemas/profile.schema'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		const profiles = await prisma.profile.findMany({
			omit: {
				userId: true,
			},
			where: {
				tag: {
					startsWith: searchParams.get('tag') ?? '',
				},
			},
			orderBy: {
				tag: 'asc',
			},
		})

		return NextResponse.json<GetProfilesSuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '프로필 목록을 조회하였습니다.',
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

import prisma from '@/src/lib/prisma'
import { ErrorResponse } from '@/src/lib/schemas/api.schema'
import {
	GetProfileParamsSchema,
	GetProfileSuccessResponse,
} from '@/src/lib/schemas/profile.schema'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ tag: string }> }
) {
	try {
		const paramsFields = GetProfileParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '태그 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.findFirst({
			omit: {
				userId: true,
			},
			where: {
				tag: paramsFields.data.tag,
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

		return NextResponse.json<GetProfileSuccessResponse>(
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

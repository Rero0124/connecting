import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ filterId: string }> }
) {
	try {
		const { filterId } = await params
		const filterIdNumber = Number(filterId)
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

		if (isNaN(filterIdNumber)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '필터 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const filter = await prisma.profileFilter.findUnique({
			where: {
				id: filterIdNumber,
			},
		})

		if (!filter) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '해당 필터가 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.profileFilter.delete({
			where: {
				id: filter.id,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '필터가 삭제되었습니다.',
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

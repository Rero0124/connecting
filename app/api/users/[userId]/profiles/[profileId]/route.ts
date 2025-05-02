import prisma from '@/src/lib/prisma'
import {
	verifyProfileIdInSession,
	verifyUserIdInSession,
} from '@/src/lib/serverUtil'
import { socket } from '@/src/lib/socket'
import { ErrorResponse, ProfileDetail, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; profileId: string }> }
) {
	try {
		const { userId, profileId } = await params
		const numberProfileId = Number(profileId)
		const data = await verifyUserIdInSession(userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		if (isNaN(numberProfileId)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '프로필 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.findFirst({
			where: {
				userId: data.response.data?.userId,
				id: numberProfileId,
			},
		})

		if (!profile) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '프로필이 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		return NextResponse.json<SuccessResponse<ProfileDetail>>(
			{
				status: 'success',
				code: 0x0,
				message: '프로필을 조회하였습니다.',
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; profileId: string }> }
) {
	try {
		const { userId, profileId } = await params
		const {
			name,
			tag,
			image,
			information,
			statusType,
			statusId,
		}: {
			name?: string
			tag?: string
			image?: string
			information?: string
			statusType?: 'common' | 'custom'
			statusId?: number
		} = await request.json()
		const data = await verifyProfileIdInSession(userId, profileId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		if (name && typeof name !== 'number') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. name 을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (tag && typeof tag !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. tag 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (image && typeof image !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. image 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (information && typeof information !== 'string') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. information 을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (statusType && statusType !== 'common' && statusType !== 'custom') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. statusType 을 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		if (information && typeof statusId !== 'number') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. statusId 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.update({
			where: {
				userId: data.response.data?.profileId,
				id: data.response.data?.userId,
			},
			data: {
				name,
				tag,
				image,
				information,
				statusType,
				statusId,
			},
		})

		const friendProfileIds = await prisma.friend.findMany({
			where: {
				profileId: profile.id,
			},
			select: {
				friendProfileId: true,
			},
		})

		socket.emit(
			'update_friends',
			friendProfileIds.map((friendProfileId) => friendProfileId.friendProfileId)
		)

		socket.emit('update_profile', [profile.id])

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '해당 프로필을 업데이트 하였습니다.',
			},
			{ status: 201 }
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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; profileId: string }> }
) {
	try {
		const { userId, profileId } = await params
		const data = await verifyProfileIdInSession(userId, profileId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		const profiles = await prisma.profile.delete({
			where: {
				userId: data.response.data?.userId,
				id: data.response.data?.profileId,
			},
		})

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '프로필을 삭제하였습니다.',
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

import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	DeleteProfileByUserParamsSchema,
	GetProfileByUserParamsSchema,
	GetProfileByUserSuccessResponse,
	UpdateProfileByUserBodySchema,
	UpdateProfileByUserParamsSchema,
} from '@/src/lib/schemas/profile.schema'
import {
	verifyProfileIdInSession,
	verifyUserIdInSession,
} from '@/src/lib/serverUtil'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; profileId: string }> }
) {
	try {
		const paramsFields = GetProfileByUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const userIdError = errorShape.userId?._errors?.[0]
			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (userIdError) {
				message = 'userId의 형식이 잘못되었습니다.'
			} else if (profileIdError) {
				message = 'profileId의 형식이 잘못되었습니다.'
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message,
				},
				{ status: 400 }
			)
		}

		const data = await verifyUserIdInSession(paramsFields.data.userId)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		const profile = await prisma.profile.findFirst({
			omit: {
				userId: true,
			},
			where: {
				userId: data.response.data.userId,
				id: paramsFields.data.profileId,
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

		return NextResponse.json<GetProfileByUserSuccessResponse>(
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
		const paramsFields = UpdateProfileByUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const userIdError = errorShape.userId?._errors?.[0]
			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (userIdError) {
				message = 'userId의 형식이 잘못되었습니다.'
			} else if (profileIdError) {
				message = 'profileId의 형식이 잘못되었습니다.'
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message,
				},
				{ status: 400 }
			)
		}

		const data = await verifyProfileIdInSession(
			paramsFields.data.userId,
			paramsFields.data.profileId
		)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		const bodyFields = UpdateProfileByUserBodySchema.safeParse(await params)

		if (!bodyFields.success) {
			const errorShape = bodyFields.error.format()

			const nameError = errorShape.name?._errors?.[0]
			const tagError = errorShape.tag?._errors?.[0]
			const imageError = errorShape.image?._errors?.[0]
			const informationError = errorShape.information?._errors?.[0]
			const statusTypeError = errorShape.statusType?._errors?.[0]
			const statusIdError = errorShape.statusId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (nameError) {
				message = 'name 의 형식이 잘못되었습니다.'
			} else if (tagError) {
				message = 'tag 의 형식이 잘못되었습니다.'
			} else if (imageError) {
				message = 'image 의 형식이 잘못되었습니다.'
			} else if (informationError) {
				message = 'information 의의 형식이 잘못되었습니다.'
			} else if (statusTypeError) {
				message = 'statusType 의 형식이 잘못되었습니다.'
			} else if (statusIdError) {
				message = 'statusId 의의 형식이 잘못되었습니다.'
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message,
				},
				{ status: 400 }
			)
		}

		const profile = await prisma.profile.update({
			where: {
				userId: data.response.data?.profileId,
				id: data.response.data?.userId,
			},
			data: bodyFields.data,
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
		const paramsFields = DeleteProfileByUserParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const userIdError = errorShape.userId?._errors?.[0]
			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'

			if (userIdError) {
				message = 'userId의 형식이 잘못되었습니다.'
			} else if (profileIdError) {
				message = 'profileId의 형식이 잘못되었습니다.'
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message,
				},
				{ status: 400 }
			)
		}

		const data = await verifyProfileIdInSession(
			paramsFields.data.userId,
			paramsFields.data.profileId
		)

		if (data.response.status === 'error') {
			return NextResponse.json<ErrorResponse>(
				{
					...data.response,
				},
				{ status: data.status }
			)
		}

		await prisma.profile.delete({
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

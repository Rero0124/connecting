import {
	RESPONSE_CODE,
	RESPONSE_CODE_DM_CREATE_DM_PARTICIPANT_BODY_INVALID,
	RESPONSE_CODE_DM_CREATE_DM_PARTICIPANT_PARAMS_INVALID,
	RESPONSE_CODE_DM_GET_DM_PARTICIPANTS_INVALID_PARAMS,
} from '@/src/lib/constants/responseCode'
import prisma from '@/src/lib/prisma'
import { ErrorResponse, SuccessResponse } from '@/src/lib/schemas/api.schema'
import {
	CreateDmParticipantBodySchema,
	GetDmParticipantsParamsSchema,
	GetDmParticipantsSuccessResponse,
} from '@/src/lib/schemas/dm.schema'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string }> }
) {
	try {
		const sessionCheck = await verifySession()

		if (!sessionCheck.isAuth) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_SESSION_INVALID,
					message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
				},
				{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status }
			)
		}

		const paramsFields = GetDmParticipantsParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const dmSessionIdError = errorShape.dmSessionId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'
			let code: RESPONSE_CODE_DM_GET_DM_PARTICIPANTS_INVALID_PARAMS =
				RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_PARAMS_INVALID

			if (dmSessionIdError) {
				message = 'dmSessionId 의 형식이 잘못되었습니다.'
				code = RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_PARAMS_INVALID_DM_SESSION_ID
			}
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code,
					message,
				},
				{ status: 400 }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			where: {
				id: paramsFields.data.dmSessionId,
			},
			select: {
				id: true,
			},
		})

		if (!dmSession) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_DM_SESSION_NOT_FOUND,
					message: '존재하지 않는 DM입니다.',
				},
				{ status: 404 }
			)
		}

		const dmParticipant = await prisma.dmParticipant.findFirst({
			where: {
				dmSessionId: dmSession.id,
				profileId: sessionCheck.profileId,
			},
			select: {
				id: true,
			},
		})

		if (!dmParticipant) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_DM_SESSION_NOT_JOIN,
					message: '해당 DM의 참여자가 아닙니다.',
				},
				{ status: 404 }
			)
		}

		const dmParticipants = await prisma.dmParticipant.findMany({
			where: {
				dmSessionId: dmSession.id,
			},
		})

		return NextResponse.json<GetDmParticipantsSuccessResponse>(
			{
				status: 'success',
				code: RESPONSE_CODE.DM.GET_DM_PARTICIPANTS_SUCCESS,
				message: 'DM의 참여자들을 조회하였습니다.',
				data: dmParticipants,
			},
			{ status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_SUCCESS.status }
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

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string }> }
) {
	try {
		const { profileId } = await request.json()
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

		const paramsFields = GetDmParticipantsParamsSchema.safeParse(await params)

		if (!paramsFields.success) {
			const errorShape = paramsFields.error.format()

			const dmSessionIdError = errorShape.dmSessionId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'
			let code: RESPONSE_CODE_DM_CREATE_DM_PARTICIPANT_PARAMS_INVALID =
				RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_PARAMS_INVALID

			if (dmSessionIdError) {
				message = 'dmSessionId 의 형식이 잘못되었습니다.'
				code =
					RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_PARAMS_INVALID_DM_SESSION_ID
			}
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code,
					message,
				},
				{ status: 400 }
			)
		}

		const bodyFields = CreateDmParticipantBodySchema.safeParse(
			await request.json()
		)

		if (!bodyFields.success) {
			const errorShape = bodyFields.error.format()

			const profileIdError = errorShape.profileId?._errors?.[0]

			let message = '요청 파라미터 형식이 잘못되었습니다.'
			let code: RESPONSE_CODE_DM_CREATE_DM_PARTICIPANT_BODY_INVALID =
				RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_BODY_INVALID

			if (profileIdError) {
				message = 'profileId 의 형식이 잘못되었습니다.'
				code = RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_BODY_INVALID_PROFILE_ID
			}

			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code,
					message,
				},
				{ status: 400 }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			where: {
				id: paramsFields.data.dmSessionId,
			},
			select: {
				id: true,
			},
		})

		if (!dmSession) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_DM_SESSION_NOT_FOUND,
					message: '존재하지 않는 DM입니다.',
				},
				{ status: 404 }
			)
		}

		const dmParticipant = await prisma.dmParticipant.findFirst({
			where: {
				dmSessionId: dmSession.id,
				profileId: sessionCheck.profileId,
			},
			select: {
				id: true,
			},
		})

		if (!dmParticipant) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_DM_SESSION_NOT_JOIN,
					message: '해당 DM의 참여자가 아닙니다.',
				},
				{ status: 404 }
			)
		}

		const profile = await prisma.profile.findFirst({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		})

		if (!profile) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.CREATE_DM_PARTICIPANT_PROFILE_NOT_FOUND,
					message: '존재하지 않는 프로필 입니다.',
				},
				{ status: 404 }
			)
		}

		const isDmParticipant = await prisma.dmParticipant.count({
			where: {
				dmSessionId: dmSession.id,
				profileId: profile.id,
			},
		})

		if (isDmParticipant > 0) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_ALREADY_PARTICIPANT,
					message: '이미 해당 방의 참여자입니다.',
				},
				{ status: 400 }
			)
		}

		await prisma.dmParticipant.create({
			data: {
				dmSessionId: dmSession.id,
				profileId: profile.id,
			},
		})

		const participantProfileIds = await prisma.dmParticipant.findMany({
			where: {
				dmSessionId: dmSession.id,
			},
			select: {
				profileId: true,
			},
		})

		socket.emit(
			'update_dmSessions',
			participantProfileIds.map(
				(participantProfileId) => participantProfileId.profileId
			)
		)

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_SUCCESS,
				message: 'DM에 참여하였습니다.',
			},
			{ status: 200 }
		)
	} catch {
		return NextResponse.json<ErrorResponse>(
			{
				status: 'error',
				code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
				message: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.message,
			},
			{ status: ResponseDictionary.kr.RESPONSE_INTERNAL_SERVER_ERROR.status }
		)
	}
}

import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import {
	DmSessionParticipantList,
	ErrorResponse,
	SuccessResponse,
} from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ dmSessionId: string }> }
) {
	try {
		const { dmSessionId } = await params
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
			select: {
				id: true,
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

		const dmParticipants = await prisma.dmParticipant.findMany({
			where: {
				dmSessionId: dmSession.id,
			},
		})

		return NextResponse.json<SuccessResponse<DmSessionParticipantList>>(
			{
				status: 'success',
				code: 0x0,
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
		const { dmSessionId } = await params
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

		if (typeof profileId !== 'number') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. joinCode 를 다시 확인하세요',
				},
				{ status: 400 }
			)
		}

		const dmSession = await prisma.dmSession.findFirst({
			where: {
				id: dmSessionId,
			},
			select: {
				id: true,
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
					code: 0x0,
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
					code: 0x0,
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
				code: 0x0,
				message: 'DM에 참여하였습니다.',
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

import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { socket } from '@/src/lib/socket'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { ResponseDictionary } from '@/src/types/dictionaries/res/dict'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> }
) {
	try {
		const { requestId } = await params
		const requestIdNumber = Number(requestId)
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

		if (isNaN(requestIdNumber)) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '친구추가 아이디의 형식이 잘못되었습니다.',
				},
				{ status: 400 }
			)
		}

		const friendRequest = await prisma.friendRequest.findFirst({
			where: {
				id: requestIdNumber,
				byProfile: {
					id: sessionCheck.profileId,
					userId: sessionCheck.userId,
				},
			},
		})

		if (!friendRequest) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '친구신청이 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.friend.create({
			data: {
				profileId: friendRequest.profileId,
				friendProfileId: friendRequest.requestProfileId,
			},
		})

		await prisma.friendRequest.delete({
			where: {
				id: friendRequest.id,
			},
		})

		socket.emit('update_friendRequests', [
			friendRequest.profileId,
			friendRequest.requestProfileId,
		])

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '친구신청을 승인하였습니다.',
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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> }
) {
	try {
		const { requestId } = await params
		const requestIdNumber = Number(requestId)
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

		const friendRequest = await prisma.friendRequest.findFirst({
			where: {
				id: requestIdNumber,
				byProfile: {
					id: sessionCheck.profileId,
					userId: sessionCheck.userId,
				},
			},
		})

		if (!friendRequest) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '친구신청이 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		await prisma.friendRequest.delete({
			where: {
				id: friendRequest.id,
			},
		})

		socket.emit('update_friendRequests', [
			friendRequest.profileId,
			friendRequest.requestProfileId,
		])

		return NextResponse.json<SuccessResponse>(
			{
				status: 'success',
				code: 0x0,
				message: '친구신청이 거절되었습니다.',
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

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
		const { type }: { type?: 'accept' | 'cancel' } = await request.json()
		const requestIdNumber = Number(requestId)
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

		if (type !== 'accept' && type !== 'cancel') {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '인자가 잘못되었습니다. type 을 다시 확인해주세요.',
				},
				{ status: 400 }
			)
		}

		const friendRequest = await prisma.friendRequest.findFirst({
			where: {
				id: requestIdNumber,
			},
		})

		if (
			!(
				friendRequest &&
				((type === 'accept' &&
					friendRequest.profileId === sessionCheck.profileId) ||
					(type === 'cancel' &&
						friendRequest.requestProfileId === sessionCheck.profileId))
			)
		) {
			return NextResponse.json<ErrorResponse>(
				{
					status: 'error',
					code: 0x0,
					message: '친구신청이 존재하지 않습니다.',
				},
				{ status: 404 }
			)
		}

		if (type === 'accept') {
			await prisma.friend.create({
				data: {
					profileId: friendRequest.profileId,
					friendProfileId: friendRequest.requestProfileId,
				},
			})

			await prisma.friend.create({
				data: {
					profileId: friendRequest.requestProfileId,
					friendProfileId: friendRequest.profileId,
				},
			})

			socket.emit('update_friends', [
				friendRequest.profileId,
				friendRequest.requestProfileId,
			])
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

		if (type === 'accept') {
			return NextResponse.json<SuccessResponse>(
				{
					status: 'success',
					code: 0x0,
					message: '친구신청을 승인하였습니다.',
				},
				{ status: 201 }
			)
		} else {
			return NextResponse.json<SuccessResponse>(
				{
					status: 'success',
					code: 0x0,
					message: '친구신청을 취소하였습니다.',
				},
				{ status: 201 }
			)
		}
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

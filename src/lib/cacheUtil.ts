import 'server-only'

import { cache } from 'react'
import { verifySession } from './session'
import prisma from './prisma'

export const getFirstDmSession = cache(async () => {
	const sessionId = await verifySession(false)

	if (!sessionId.isAuth) return null

	const dmSession = await prisma.dmSession.findFirst({
		where: {
			participant: {
				some: {
					profile: {
						id: sessionId.profileId,
						userId: sessionId.userId,
					},
					isNotAllowed: false,
				},
			},
		},
		select: { id: true, name: true },
	})

	return dmSession
})

export const getFirstRoom = cache(async () => {
	const sessionId = await verifySession(false)

	if (!sessionId.isAuth) return null

	const room = await prisma.room.findFirst({
		where: {
			participant: {
				some: {
					profile: {
						id: sessionId.profileId,
						userId: sessionId.userId,
					},
				},
			},
		},
		select: { id: true, name: true },
	})

	return room
})

export const getFirstChannelInRoom = cache(async (roomId: string) => {
	const sessionId = await verifySession(false)

	if (!sessionId.isAuth) return null

	const channel = await prisma.roomChannel.findFirst({
		where: {
			room: {
				id: roomId,
				participant: {
					some: {
						profile: {
							id: sessionId.profileId,
							userId: sessionId.userId,
						},
					},
				},
			},
		},
		select: { id: true, name: true },
	})

	return channel
})

export const getRoomById = cache(async (roomId: string) => {
	const sessionId = await verifySession(false)

	if (!sessionId.isAuth) return null

	const room = await prisma.room.findFirst({
		where: {
			id: roomId,
			participant: {
				some: {
					profile: {
						id: sessionId.profileId,
						userId: sessionId.userId,
					},
				},
			},
		},
		select: { id: true, name: true },
	})

	return room
})

export const getChannelByRoomIdAndId = cache(
	async (roomId: string, channelId?: bigint) => {
		const channel = await prisma.roomChannel.findFirst({
			where: {
				id: channelId,
				roomId,
			},
		})

		return channel
	}
)

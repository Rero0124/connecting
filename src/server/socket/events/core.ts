import { z } from 'zod'
import { SocektGlobalData, SocketServer, SocketSocekt } from '../types'
import { DmMessageSchema } from '../../../lib/schemas/dm.schema'
import { RoomMessageSchema } from '../../../lib/schemas/room.schema'
import { isBigInt, toBigInt } from '@/src/lib/util'

export function registerCoreEvents(
	io: SocketServer,
	socket: SocketSocekt,
	globalData: SocektGlobalData
) {
	const ClientToServerCoreSchemas = {
		set_profileId: z.tuple([z.coerce.bigint()]),
		update_profile: z.tuple([z.array(z.coerce.bigint())]),
		update_rooms: z.tuple([z.array(z.coerce.bigint())]),
		update_roomChannels: z.tuple([z.array(z.coerce.bigint()), z.string()]),
		update_dmSessions: z.tuple([z.array(z.coerce.bigint())]),
		update_friends: z.tuple([z.array(z.coerce.bigint())]),
		update_friendRequests: z.tuple([z.array(z.coerce.bigint())]),
		send_dmMessage: z.tuple([DmMessageSchema, z.array(z.coerce.bigint())]),
		send_roomMessage: z.tuple([RoomMessageSchema, z.array(z.coerce.bigint())]),
	}

	const getSocketIdByProfileIds = (profileIds: string[]) => {
		return profileIds
			.map((profileId) => globalData.socketMap.get(profileId))
			.filter((socketId) => socketId !== undefined)
	}

	socket.use(([event, ...args], next) => {
		const schema =
			ClientToServerCoreSchemas[event as keyof typeof ClientToServerCoreSchemas]
		if (!schema) return next()

		const result = schema.safeParse(args)
		if (!result.success) {
			console.warn(`Invalid payload for event "${event}"`, result.error)
			return next(new Error('Invalid socket payload'))
		}

		next()
	})

	socket.emit('get_profileId')

	socket.on('set_profileId', (profileId) => {
		socket.data.profileId = profileId
		const oldSocketId = globalData.socketMap.get(profileId)
		if (oldSocketId && socket.id !== oldSocketId) {
			const oldSocket = io.sockets.sockets.get(oldSocketId)
			if (oldSocket) {
				oldSocket.data.profileId = undefined
				oldSocket.emit('loggedIn_sameProfile')
			}
		}
		if (socket.id) {
			globalData.socketMap.set(profileId, socket.id)
		}
	})

	socket.on('update_profile', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_profile')
	})

	socket.on('update_rooms', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_rooms')
	})

	socket.on('update_roomChannels', (profileIds, roomId) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit(
			'update_roomChannels',
			roomId
		)
	})

	socket.on('update_dmSessions', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_dmSessions')
	})

	socket.on('update_friends', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_friends')
	})

	socket.on('update_friendRequests', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_friendRequests')
	})

	socket.on('send_dmMessage', async (dmMesage, profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit(
			'received_dmMessage',
			dmMesage
		)
	})

	socket.on('send_roomMessage', async (roomMessage, profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit(
			'received_roomMessage',
			roomMessage
		)
	})
}

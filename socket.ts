import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import http2 from 'http2'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import prisma from './src/lib/prisma'

export interface ServerToClientEvents {
	update_profile: () => void
	update_rooms: () => void
	update_dmSessions: () => void
	update_friends: () => void
	update_friendRequests: () => void
	received_dmMessage: (dmSessionId: string, message: string) => void
	received_roomMessage: (roomId: string, message: string) => void
}

export interface ClientToServerEvents {
	set_profileId: (profileId: number) => void
	update_profile: (profileIds: number[]) => void
	update_rooms: (profileIds: number[]) => void
	update_dmSessions: (profileIds: number[]) => void
	update_friends: (profileIds: number[]) => void
	update_friendRequests: (profileIds: number[]) => void
	send_dmMessage: (dmSessionId: string, message: string) => void
	send_roomMessage: (roomId: string, message: string) => void
}

export interface SocketData {
	profileId?: number
}

dotenv.config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

const httpVersion = process.env.SOCKET_HTTP
const hostname = process.env.SOCKET_HOST ?? 'localhost'
const port = isNaN(Number(process.env.SOCKET_PORT))
	? 3000
	: Number(process.env.SOCKET_PORT)

let server
if (httpVersion === 'HTTP/2') {
	server = http2.createSecureServer({
		allowHTTP1: true,
		key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
		cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
	})
} else if (httpVersion === 'HTTPS') {
	server = https.createServer({
		key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
		cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
	})
} else if (httpVersion === 'HTTP/1') {
	server = http.createServer()
} else {
	new Error('invaild http version')
}

const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	{},
	SocketData
>(server, {
	cors: {
		origin: 'https://connecting.rero0124.com',
	},
})

const socketMap = new Map<number, string>()

io.engine.on('connection', (rawSocket) => {})

io.on('connection', (socket) => {
	socket.on('set_profileId', (profileId) => {
		if (typeof profileId === 'number' && profileId > 0) {
			socket.data.profileId = profileId
			socketMap.set(profileId, socket.id)
		}
	})

	socket.on('update_profile', (profileIds) => {
		if (
			Array.isArray(profileIds) &&
			profileIds.every(
				(id) => typeof id === 'number' && Number.isInteger(id) && id >= 0
			)
		) {
			profileIds.map((profileId) => {
				const socketId = socketMap.get(profileId)
				if (socketId) {
					io.to(socketId).emit('update_profile')
				}
			})
		}
	})

	socket.on('update_rooms', (profileIds) => {
		if (
			Array.isArray(profileIds) &&
			profileIds.every(
				(id) => typeof id === 'number' && Number.isInteger(id) && id >= 0
			)
		) {
			profileIds.map((profileId) => {
				const socketId = socketMap.get(profileId)
				if (socketId) {
					io.to(socketId).emit('update_rooms')
				}
			})
		}
	})

	socket.on('update_dmSessions', (profileIds) => {
		if (
			Array.isArray(profileIds) &&
			profileIds.every(
				(id) => typeof id === 'number' && Number.isInteger(id) && id >= 0
			)
		) {
			profileIds.map((profileId) => {
				const socketId = socketMap.get(profileId)
				if (socketId) {
					io.to(socketId).emit('update_dmSessions')
				}
			})
		}
	})

	socket.on('update_friends', (profileIds) => {
		if (
			Array.isArray(profileIds) &&
			profileIds.every(
				(id) => typeof id === 'number' && Number.isInteger(id) && id >= 0
			)
		) {
			profileIds.map((profileId) => {
				const socketId = socketMap.get(profileId)
				if (socketId) {
					io.to(socketId).emit('update_friends')
				}
			})
		}
	})

	socket.on('update_friendRequests', (profileIds) => {
		if (
			Array.isArray(profileIds) &&
			profileIds.every(
				(id) => typeof id === 'number' && Number.isInteger(id) && id >= 0
			)
		) {
			profileIds.map((profileId) => {
				const socketId = socketMap.get(profileId)
				if (socketId) {
					io.to(socketId).emit('update_friendRequests')
				}
			})
		}
	})

	socket.on('send_dmMessage', async (dmSessionId, message) => {
		if (socket.data.profileId) {
			const dmSession = await prisma.dmSession.findUnique({
				where: {
					id: dmSessionId,
					participant: {
						some: {
							profileId: socket.data.profileId,
						},
					},
				},
				select: {
					id: true,
				},
			})

			if (dmSession) {
				const socketMessage = io.sockets.adapter.rooms.get(dmSession.id)
				if (!socketMessage) socket.join(dmSession.id)
				await prisma.dmMessage.create({
					data: {
						content: message,
						dmSessionId: dmSession.id,
						profileId: socket.data.profileId,
					},
				})
				io.to(dmSession.id).emit('received_dmMessage', dmSessionId, message)
			}
		}
	})

	socket.on('send_roomMessage', async (roomId, message) => {
		if (socket.data.profileId) {
			const room = await prisma.room.findUnique({
				where: {
					id: roomId,
					participant: {
						some: {
							profileId: socket.data.profileId,
						},
					},
				},
			})

			if (room) {
				const socketRoom = io.sockets.adapter.rooms.get(room.id)
				if (!socketRoom) socket.join(room.id)
				await prisma.roomMessage.create({
					data: {
						content: message,
						roomId: room.id,
						profileId: socket.data.profileId,
					},
				})
				io.to(room.id).emit('received_roomMessage', roomId, message)
			}
		}
	})

	socket.on('disconnect', (reason) => {
		if (socket.data.profileId) {
			socketMap.delete(socket.data.profileId)
		}
	})
})

if (server) {
	server
		.once('error', (err) => {
			console.error(err)
			process.exit(1)
		})
		.listen(port, () => {
			console.log(
				`> Socket Ready on ${httpVersion === 'HTTP/1' ? 'http' : 'https'}://${hostname}:${port}`
			)
		})
}

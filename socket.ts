import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import http2 from 'http2'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import prisma from './src/lib/prisma'
import { DmMessageDetail, RoomMessageDetail } from './src/types/api'

export interface ServerToClientEvents {
	get_profileId: () => void
	loggedIn_sameProfile: () => void
	update_profile: () => void
	update_rooms: () => void
	update_dmSessions: () => void
	update_friends: () => void
	update_friendRequests: () => void
	received_dmMessage: (dmMessage: DmMessageDetail) => void
	received_roomMessage: (roomMessage: RoomMessageDetail) => void
}

export interface ClientToServerEvents {
	set_profileId: (profileId: number) => void
	update_profile: (profileIds: number[]) => void
	update_rooms: (profileIds: number[]) => void
	update_dmSessions: (profileIds: number[]) => void
	update_friends: (profileIds: number[]) => void
	update_friendRequests: (profileIds: number[]) => void
	send_dmMessage: (dmMessage: DmMessageDetail, profileIds: number[]) => void
	send_roomMessage: (
		roomMessage: RoomMessageDetail,
		profileIds: number[]
	) => void
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
		origin: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
	transports: ['polling', 'websocket'],
})

const socketMap = new Map<number, string>()

io.engine.on('connection', (rawSocket) => {})

io.on('connection', (socket) => {
	const getSocketIdByProfileIds = (profileIds: number[]) => {
		return profileIds
			.map((profileId) => socketMap.get(profileId))
			.filter((socketId) => socketId !== undefined)
	}

	socket.emit('get_profileId')

	socket.on('set_profileId', (profileId) => {
		socket.data.profileId = profileId
		const oldSocketId = socketMap.get(profileId)
		if (oldSocketId && socket.id !== oldSocketId) {
			const oldSocket = io.sockets.sockets.get(oldSocketId)
			if (oldSocket) {
				oldSocket.data.profileId = undefined
				oldSocket.emit('loggedIn_sameProfile')
			}
		}
		if (socket.id) {
			socketMap.set(profileId, socket.id)
		}
	})

	socket.on('update_profile', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_profile')
	})

	socket.on('update_rooms', (profileIds) => {
		io.to(getSocketIdByProfileIds(profileIds)).emit('update_rooms')
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

import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import http2 from 'http2'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import prisma from './src/lib/prisma'

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

const io = new Server(server, {
	cors: {
		origin: 'https://connecting.rero0124.com',
	},
})

const socketMap = new Map<number, string>()

io.engine.on('connection', (rawSocket) => {})

io.on('connection', (socket) => {
	socket.on('send userProfileId', (userProfileId) => {
		if (
			userProfileId !== undefined ||
			!isNaN(Number(userProfileId)) ||
			Number(userProfileId) > -1
		) {
			socket.data.profileId = userProfileId
			socketMap.set(Number(userProfileId), socket.id)
		}
	})

	socket.on('chat message', async (messageId, chat) => {
		if (socket.data.profileId) {
			const room = await prisma.message.findUnique({
				where: {
					id: messageId,
					messageUser: {
						some: {
							userProfileId: socket.data.profileId,
						},
					},
				},
			})

			if (room) {
				const socketMessage = io.sockets.adapter.rooms.get(room.id)
				if (!socketMessage) socket.join(room.id)
				io.to(room.id).emit('chat message', chat)
			}
		}
	})

	socket.on('chat room', async (roomId, chat) => {
		if (socket.data.profileId) {
			const room = await prisma.room.findUnique({
				where: {
					id: roomId,
					roomUser: {
						some: {
							userProfileId: socket.data.profileId,
						},
					},
				},
			})

			if (room) {
				const socketRoom = io.sockets.adapter.rooms.get(room.id)
				if (!socketRoom) socket.join(room.id)
				io.to(room.id).emit('chat room', chat)
			}
		}
	})

	socket.on('disconnect', (reason) => {
		socketMap.delete(socket.data.profileId)
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

import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import next from 'next'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import prisma from './src/lib/prisma'

dotenv.config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

const dev = process.env.NODE_ENV !== 'production'
const isHttps = process.env.HTTPS === 'true'
const turbo = dev
const hostname = process.env.HOST ?? 'localhost'
const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)

const app = next({ dev, hostname, port, turbo })
const handler = app.getRequestHandler()

app.prepare().then(() => {
	let server
	if (isHttps) {
		server = https.createServer(
			{
				key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
				cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
			},
			handler
		)
	} else {
		server = http.createServer(handler)
	}

	const socketMap = new Map<number, string>()

	const io = new Server(server)

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
				const room = await prisma.dmSession.findUnique({
					where: {
						id: messageId,
						participant: {
							some: {
								profileId: socket.data.profileId,
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
					io.to(room.id).emit('chat room', chat)
				}
			}
		})

		socket.on('disconnect', (reason) => {
			socketMap.delete(socket.data.profileId)
		})
	})

	server
		.once('error', (err) => {
			console.error(err)
			process.exit(1)
		})
		.listen(port, () => {
			console.log(
				`> Ready on ${isHttps ? 'https' : 'http'}://${hostname}:${port}`
			)
		})
})

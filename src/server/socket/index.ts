import http from 'http'
import type { Server as HTTPSServer } from 'https'
import type { Http2SecureServer, Http2Server } from 'http2'
import { Server } from 'socket.io'
import {
	ClientToServerEvents,
	ServerToClientEvents,
	SocektGlobalData,
	SocketData,
	SocketServer,
} from './types'
import { registerSocketEvents } from './events'
import { createWorker } from 'mediasoup'

export async function setupSocket(
	server: http.Server | HTTPSServer | Http2SecureServer | Http2Server
) {
	const io: SocketServer = new Server<
		ClientToServerEvents,
		ServerToClientEvents,
		{},
		SocketData
	>(server, {
		cors: {
			origin: (origin, callback) => {
				const allowedOrigins = [
					'http://localhost:3000',
					process.env.NEXT_PUBLIC_BASE_URL,
				].filter(Boolean)

				if (!origin || allowedOrigins.includes(origin)) {
					callback(null, true)
				} else {
					callback(new Error('Not allowed by CORS'))
				}
			},
			methods: ['GET', 'POST'],
		},
		transports: ['polling', 'websocket'],
	})

	const worker = await createWorker()
	const router = await worker.createRouter({
		mediaCodecs: [
			{
				kind: 'audio',
				mimeType: 'audio/opus',
				clockRate: 48000,
				channels: 2,
			},
			{
				kind: 'video',
				mimeType: 'video/VP8',
				clockRate: 90000,
			},
			{
				kind: 'video',
				mimeType: 'video/H264',
				clockRate: 90000,
				parameters: {
					'packetization-mode': 1,
					'profile-level-id': '42e01f',
					'level-asymmetry-allowed': 1,
				},
			},
		],
	})

	const globalData: SocektGlobalData = {
		socketMap: new Map<number, string>(),
		worker: worker,
		router: router,
		sendTransports: {},
		recvTransports: {},
		producers: {},
		peerStates: {},
	}

	io.on('connection', (socket) => registerSocketEvents(io, socket, globalData))
}

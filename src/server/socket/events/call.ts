import { z } from 'zod'
import { SocektGlobalData, SocketServer, SocketSocekt } from '../types'
import {
	DtlsParametersSchema,
	PeerState,
	PeerStateSchema,
	RtpCapabilitiesSchema,
	TransportTypeSchema,
	VoiceConsumeRequestSchema,
	VoiceConsumeResponseSchema,
	VoiceProduceOptionsSchema,
	VoiceTransportOptionsSchema,
} from '../schemas/call.schema'

export function registerCallEvents(
	io: SocketServer,
	socket: SocketSocekt,
	globalData: SocektGlobalData
) {
	const ClientToServerCoreSchemas = {
		call_createTransport: z.tuple([
			TransportTypeSchema,
			z
				.function()
				.args(
					z.union([
						VoiceTransportOptionsSchema,
						z.object({ error: z.string() }),
					])
				)
				.returns(z.void()),
		]),
		call_connectTransport: z.tuple([
			z.object({
				dtlsParameters: DtlsParametersSchema,
				type: TransportTypeSchema,
			}),
		]),
		call_produce: z.tuple([
			VoiceProduceOptionsSchema.extend({
				callId: z.string(),
			}),
			z
				.function()
				.args(
					z.object({
						id: z.string(),
					})
				)
				.returns(z.void()),
		]),
		call_getRouterRtpCapabilities: z.tuple([
			z.function().args(RtpCapabilitiesSchema).returns(z.void()),
		]),
		call_consume: z.tuple([
			VoiceConsumeRequestSchema,
			z.function().args(VoiceConsumeResponseSchema).returns(z.void()),
		]),
		call_updatePeerState: z.tuple([
			PeerStateSchema.partial(),
			z.function().args().returns(z.void()),
		]),
		call_getPeerStates: z.tuple([
			z.string(),
			z
				.function()
				.args(
					z.union([
						z.array(PeerStateSchema),
						z.object({
							error: z.string(),
						}),
					])
				)
				.returns(z.void()),
		]),
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

	socket.on('call_createTransport', async (type, callback) => {
		if (!globalData.router) return callback({ error: 'Router not ready' })

		const transport = await globalData.router.createWebRtcTransport({
			listenIps: [
				{
					ip: '0.0.0.0',
					announcedIp: `${process.env.NEXT_PUBLIC_MEDIASOUP_URL ?? '127.0.0.1'}`,
				},
			],
			enableUdp: true,
			enableTcp: true,
		})

		if (type === 'send') {
			globalData.sendTransports[socket.id] = transport
		} else {
			globalData.recvTransports[socket.id] = transport
		}

		callback({
			id: transport.id,
			iceParameters: transport.iceParameters,
			iceCandidates: transport.iceCandidates,
			dtlsParameters: transport.dtlsParameters,
		})
	})

	socket.on('call_connectTransport', async ({ dtlsParameters, type }) => {
		const transport =
			type === 'send'
				? globalData.sendTransports[socket.id]
				: globalData.recvTransports[socket.id]
		if (!transport) return
		await transport.connect({ dtlsParameters })
	})

	socket.on(
		'call_produce',
		async ({ kind, rtpParameters, callId }, callback) => {
			const transport = globalData.sendTransports[socket.id]
			if (!transport) return

			const producer = await transport.produce({ kind, rtpParameters })
			if (!globalData.producers[socket.id]) {
				globalData.producers[socket.id] = []
			}
			globalData.producers[socket.id].push(producer)
			callback({ id: producer.id })

			socket.data.callId = callId

			socket.join(callId)
			socket.to(callId).emit('call_newProducer', {
				producerId: producer.id,
				socketId: socket.id,
				kind: producer.kind,
			})
		}
	)

	socket.on('call_getRouterRtpCapabilities', (callback) => {
		callback(globalData.router.rtpCapabilities)
	})

	socket.on('call_getPeerStates', (callId, callback) => {
		if (!callId) return callback({ error: 'Missing callId' })

		const peersInRoom = Array.from(io.sockets.adapter.rooms.get(callId) || [])
		const states: PeerState[] = []

		for (const socketId of peersInRoom) {
			const state = globalData.peerStates[socketId]
			if (state) {
				states.push(state)
			}
		}

		callback(states)
	})

	socket.on('call_updatePeerState', (state, callback) => {
		const current = globalData.peerStates[socket.id] || {}
		globalData.peerStates[socket.id] = { ...current, ...state }
		if (socket.data.callId) {
			socket
				.to(socket.data.callId)
				.emit('call_peerStateUpdated', socket.id, state)
		}

		callback()
	})

	socket.on(
		'call_consume',
		async ({ producerId, rtpCapabilities, kind, callId }, callback) => {
			const allProducers = Object.values(globalData.producers).flat()
			const producer = allProducers.find((p) => p.id === producerId)
			const transport = globalData.recvTransports[socket.id]

			if (
				!producer ||
				!globalData.router.canConsume({ producerId, rtpCapabilities }) ||
				!transport
			) {
				return callback({ error: 'Cannot consume' })
			}

			const consumer = await transport.consume({
				producerId,
				rtpCapabilities,
				paused: false,
			})

			callback({
				id: consumer.id,
				producerId: consumer.producerId,
				kind: consumer.kind,
				rtpParameters: consumer.rtpParameters,
			})
		}
	)
}

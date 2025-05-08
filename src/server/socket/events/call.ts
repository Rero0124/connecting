import {
	PeerState,
	SocektGlobalData,
	SocketServer,
	SocketSocekt,
} from '../types'

export function registerCallEvents(
	io: SocketServer,
	socket: SocketSocekt,
	globalData: SocektGlobalData
) {
	socket.on('call_createTransport', async (type, callback) => {
		if (!globalData.router) return callback({ error: 'Router not ready' })

		const transport = await globalData.router.createWebRtcTransport({
			listenIps: [{ ip: '0.0.0.0', announcedIp: '221.141.191.225' }],
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

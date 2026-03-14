'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Device } from 'mediasoup-client'
import { socket } from '@/src/lib/socket'
import type {
	PeerState,
	MediaKind,
} from '@/src/server/socket/schemas/call.schema'

// mediasoup-client types are incompatible with Zod schemas at boundaries, use any
type Transport = any
type Consumer = any
type Producer = any

interface RemotePeer {
	socketId: string
	consumers: Consumer[]
	stream: MediaStream
	state: Partial<PeerState>
}

export function useVoiceCall(callId: string, profileId: number) {
	const [joined, setJoined] = useState(false)
	const [micOn, setMicOn] = useState(true)
	const [cameraOn, setCameraOn] = useState(false)
	const [screenOn, setScreenOn] = useState(false)
	const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
		new Map()
	)
	const [localStream, setLocalStream] = useState<MediaStream | null>(null)
	const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null)
	const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null)

	const deviceRef = useRef<Device | null>(null)
	const sendTransportRef = useRef<Transport | null>(null)
	const recvTransportRef = useRef<Transport | null>(null)
	const audioProducerRef = useRef<Producer | null>(null)
	const videoProducerRef = useRef<Producer | null>(null)
	const screenProducerRef = useRef<Producer | null>(null)
	const remotePeersRef = useRef<Map<string, RemotePeer>>(new Map())

	const updateRemotePeers = useCallback(
		(updater: (prev: Map<string, RemotePeer>) => Map<string, RemotePeer>) => {
			remotePeersRef.current = updater(remotePeersRef.current)
			setRemotePeers(new Map(remotePeersRef.current))
		},
		[]
	)

	const createTransport = useCallback(
		(type: 'send' | 'recv'): Promise<Transport> => {
			return new Promise((resolve, reject) => {
				socket.emit('call_createTransport', type, (params) => {
					if ('error' in params) return reject(new Error(params.error))

					const device = deviceRef.current!
					const transport =
						type === 'send'
							? device.createSendTransport(params)
							: device.createRecvTransport(params)

					transport.on('connect', ({ dtlsParameters }, callback) => {
						socket.emit('call_connectTransport', {
							dtlsParameters: dtlsParameters as any,
							type,
						})
						callback()
					})

					if (type === 'send') {
						transport.on('produce', ({ kind, rtpParameters }, callback) => {
							socket.emit(
								'call_produce',
								{
									kind: kind as any,
									rtpParameters: rtpParameters as any,
									callId,
								},
								({ id }) => callback({ id })
							)
						})
					}

					resolve(transport)
				})
			})
		},
		[callId]
	)

	const consumeProducer = useCallback(
		async (producerId: string, socketId: string, kind: MediaKind) => {
			const device = deviceRef.current
			const recvTransport = recvTransportRef.current
			if (!device || !recvTransport) return

			socket.emit(
				'call_consume',
				{
					producerId,
					callId,
					kind,
					rtpCapabilities: device.rtpCapabilities as any,
				},
				(response) => {
					if ('error' in response) {
						console.warn('Consume error:', response.error)
						return
					}

					recvTransport
						.consume({
							id: response.id,
							producerId: response.producerId,
							kind: response.kind as any,
							rtpParameters: response.rtpParameters as any,
						})
						.then((consumer: Consumer) => {
							updateRemotePeers((prev) => {
								const existing = prev.get(socketId)
								const stream = existing?.stream ?? new MediaStream()
								stream.addTrack(consumer.track)
								prev.set(socketId, {
									socketId,
									consumers: [...(existing?.consumers ?? []), consumer],
									stream,
									state: existing?.state ?? {},
								})
								return prev
							})
						})
				}
			)
		},
		[callId, updateRemotePeers]
	)

	const join = useCallback(async () => {
		try {
			const device = new Device()
			deviceRef.current = device

			await new Promise<void>((resolve, reject) => {
				socket.emit('call_getRouterRtpCapabilities', async (caps) => {
					try {
						await device.load({ routerRtpCapabilities: caps as any })
						resolve()
					} catch (e) {
						reject(e)
					}
				})
			})

			const sendTransport = await createTransport('send')
			sendTransportRef.current = sendTransport

			const recvTransport = await createTransport('recv')
			recvTransportRef.current = recvTransport

			// Get mic stream
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			})
			setLocalStream(stream)

			const audioTrack = stream.getAudioTracks()[0]
			if (audioTrack) {
				audioProducerRef.current = await sendTransport.produce({
					track: audioTrack,
				})
			}

			// Update peer state
			socket.emit(
				'call_updatePeerState',
				{ profileId, isMicOn: true, isCameraOn: false, isScreenOn: false },
				() => {}
			)

			// Get existing peers
			socket.emit('call_getPeerStates', callId, (peers) => {
				if (Array.isArray(peers)) {
					// peers are already in the room, we'll get their producers via call_newProducer
				}
			})

			setJoined(true)
			setMicOn(true)
			setCameraOn(false)
			setScreenOn(false)
		} catch (err) {
			console.error('Failed to join voice channel:', err)
		}
	}, [callId, profileId, createTransport])

	const leave = useCallback(() => {
		audioProducerRef.current?.close()
		videoProducerRef.current?.close()
		screenProducerRef.current?.close()
		audioProducerRef.current = null
		videoProducerRef.current = null
		screenProducerRef.current = null

		sendTransportRef.current?.close()
		recvTransportRef.current?.close()
		sendTransportRef.current = null
		recvTransportRef.current = null

		localStream?.getTracks().forEach((t) => t.stop())
		setLocalStream(null)
		localCameraStream?.getTracks().forEach((t) => t.stop())
		setLocalCameraStream(null)
		localScreenStream?.getTracks().forEach((t) => t.stop())
		setLocalScreenStream(null)

		remotePeersRef.current.forEach((peer) => {
			peer.consumers.forEach((c) => c.close())
			peer.stream.getTracks().forEach((t) => t.stop())
		})
		remotePeersRef.current = new Map()
		setRemotePeers(new Map())

		deviceRef.current = null
		setJoined(false)
	}, [localStream, localCameraStream, localScreenStream])

	const toggleMic = useCallback(() => {
		const producer = audioProducerRef.current
		if (!producer) return

		if (micOn) {
			producer.pause()
		} else {
			producer.resume()
		}
		const next = !micOn
		setMicOn(next)
		socket.emit('call_updatePeerState', { isMicOn: next }, () => {})
	}, [micOn])

	const toggleCamera = useCallback(async () => {
		if (cameraOn) {
			videoProducerRef.current?.close()
			videoProducerRef.current = null
			localCameraStream?.getTracks().forEach((t) => t.stop())
			setLocalCameraStream(null)
			setCameraOn(false)
			socket.emit('call_updatePeerState', { isCameraOn: false }, () => {})
		} else {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				})
				const videoTrack = stream.getVideoTracks()[0]
				if (videoTrack && sendTransportRef.current) {
					videoProducerRef.current = await sendTransportRef.current.produce({
						track: videoTrack,
					})
					setLocalCameraStream(stream)
					setCameraOn(true)
					socket.emit('call_updatePeerState', { isCameraOn: true }, () => {})
				}
			} catch (err) {
				console.error('Failed to enable camera:', err)
			}
		}
	}, [cameraOn, localCameraStream])

	const toggleScreen = useCallback(async () => {
		if (screenOn) {
			screenProducerRef.current?.close()
			screenProducerRef.current = null
			localScreenStream?.getTracks().forEach((t) => t.stop())
			setLocalScreenStream(null)
			setScreenOn(false)
			socket.emit('call_updatePeerState', { isScreenOn: false }, () => {})
		} else {
			try {
				const stream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
				})
				const screenTrack = stream.getVideoTracks()[0]
				if (screenTrack && sendTransportRef.current) {
					screenProducerRef.current = await sendTransportRef.current.produce({
						track: screenTrack,
					})

					screenTrack.onended = () => {
						screenProducerRef.current?.close()
						screenProducerRef.current = null
						setLocalScreenStream(null)
						setScreenOn(false)
						socket.emit('call_updatePeerState', { isScreenOn: false }, () => {})
					}

					setLocalScreenStream(stream)
					setScreenOn(true)
					socket.emit('call_updatePeerState', { isScreenOn: true }, () => {})
				}
			} catch (err) {
				console.error('Failed to share screen:', err)
			}
		}
	}, [screenOn, localScreenStream])

	// Socket event listeners
	useEffect(() => {
		if (!joined) return

		const onNewProducer = ({
			producerId,
			socketId,
			kind,
		}: {
			producerId: string
			socketId: string
			kind: MediaKind
		}) => {
			consumeProducer(producerId, socketId, kind)
		}

		const onPeerStateUpdated = (
			socketId: string,
			state: Partial<PeerState>
		) => {
			updateRemotePeers((prev) => {
				const existing = prev.get(socketId)
				if (existing) {
					prev.set(socketId, {
						...existing,
						state: { ...existing.state, ...state },
					})
				} else {
					prev.set(socketId, {
						socketId,
						consumers: [],
						stream: new MediaStream(),
						state,
					})
				}
				return prev
			})
		}

		const onPeerLeft = (peer: Partial<PeerState>) => {
			// Find socketId by profileId
			updateRemotePeers((prev) => {
				for (const [sid, p] of prev) {
					if (p.state.profileId === peer.profileId) {
						p.consumers.forEach((c) => c.close())
						p.stream.getTracks().forEach((t) => t.stop())
						prev.delete(sid)
						break
					}
				}
				return prev
			})
		}

		socket.on('call_newProducer', onNewProducer)
		socket.on('call_peerStateUpdated', onPeerStateUpdated)
		socket.on('call_peerLeft', onPeerLeft)

		return () => {
			socket.off('call_newProducer', onNewProducer)
			socket.off('call_peerStateUpdated', onPeerStateUpdated)
			socket.off('call_peerLeft', onPeerLeft)
		}
	}, [joined, consumeProducer, updateRemotePeers])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (joined) {
				leave()
			}
		}
	}, [])

	return {
		joined,
		micOn,
		cameraOn,
		screenOn,
		localStream,
		localCameraStream,
		localScreenStream,
		remotePeers,
		join,
		leave,
		toggleMic,
		toggleCamera,
		toggleScreen,
	}
}

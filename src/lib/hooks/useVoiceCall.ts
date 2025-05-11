'use client'

import { socket } from '@/src/lib/socket'
import {
	PeerState,
	VoiceTransportOptions,
} from '@/src/server/socket/schemas/call.schema'
import * as mediasoupClient from 'mediasoup-client'
import { RtpCapabilities } from 'mediasoup/types'
import { useEffect, useRef, useState } from 'react'

type CallType = 'only-voice' | 'only-camera' | 'only-screen'
type CallControll = {
	startCalling: (callId: string) => Promise<void>
	stopCalling: () => void
	getJoinList: () => Promise<PeerState[]>
}
type VoiceControl = { toggleMic: () => void; isMicOn: boolean }
type CameraControl = { toggleCamera: () => Promise<void>; isCameraOn: boolean }
type ScreenControl = { toggleScreen: () => Promise<void>; isScreenOn: boolean }

function createFixedDisplay(): HTMLElement {
	let container = document.getElementById('video-display')
	if (!container) {
		container = document.createElement('div')
		container.id = 'video-display'
		Object.assign(container.style, {
			position: 'fixed',
			bottom: '16px',
			right: '16px',
			width: '320px',
			height: '240px',
			borderRadius: '12px',
			overflow: 'hidden',
			zIndex: '9999',
			background: 'black',
			cursor: 'pointer',
			display: 'none',
			alignItems: 'center',
			justifyContent: 'center',
		})

		let isDragging = false
		let offsetX = 0
		let offsetY = 0

		container.addEventListener('mousedown', (e) => {
			if (!container) return
			isDragging = true
			offsetX = e.clientX - container.getBoundingClientRect().left
			offsetY = e.clientY - container.getBoundingClientRect().top
			container.style.cursor = 'grabbing'
		})
		document.addEventListener('mousemove', (e) => {
			if (!isDragging || !container) return
			container.style.left = `${e.clientX - offsetX}px`
			container.style.top = `${e.clientY - offsetY}px`
			container.style.bottom = 'auto'
			container.style.right = 'auto'
		})
		document.addEventListener('mouseup', () => {
			if (!container) return
			isDragging = false
			container.style.cursor = 'pointer'
		})

		document.body.appendChild(container)
	}
	return container
}

function appendVideoElement(video: HTMLVideoElement) {
	const container = createFixedDisplay()
	container.style.display = 'flex' // 보여줌

	video.autoplay = true
	video.playsInline = true
	video.muted = true
	video.style.width = '100%'
	video.style.height = '100%'
	video.style.objectFit = 'cover'
	video.style.display = 'none'

	container.appendChild(video)
}

function updateDisplayedVideo(
	videoElements: HTMLVideoElement[],
	activeIndex: number
) {
	const container = createFixedDisplay()
	if (videoElements.length === 0) {
		container.style.display = 'none'
		return
	}
	videoElements.forEach((video, i) => {
		video.style.display = i === activeIndex ? 'block' : 'none'
	})
	container.style.display = 'flex'
}

export function useVoiceCall(): CallControll &
	VoiceControl &
	CameraControl &
	ScreenControl
export function useVoiceCall(
	callType: 'only-voice'
): CallControll & VoiceControl
export function useVoiceCall(
	callType: 'only-camera'
): CallControll & CameraControl
export function useVoiceCall(
	callType: 'only-screen'
): CallControll & ScreenControl
export function useVoiceCall(
	callType?: CallType
):
	| (CallControll & VoiceControl & CameraControl & ScreenControl)
	| (CallControll & VoiceControl)
	| (CallControll & CameraControl)
	| (CallControll & ScreenControl)
export function useVoiceCall(
	callType?: CallType
):
	| (CallControll & VoiceControl & CameraControl & ScreenControl)
	| (CallControll & VoiceControl)
	| (CallControll & CameraControl)
	| (CallControll & ScreenControl) {
	const [callId, setCallId] = useState<string | null>(null)
	const [isMicOn, setIsMicOn] = useState(true)
	const [isCameraOn, setIsCameraOn] = useState(false)
	const [isScreenOn, setIsScreenOn] = useState(false)

	const [sendTransport, setSendTransport] =
		useState<mediasoupClient.types.Transport | null>(null)
	const [recvTransport, setRecvTransport] =
		useState<mediasoupClient.types.Transport | null>(null)
	const [voiceProducer, setVoiceProducer] =
		useState<mediasoupClient.types.Producer | null>(null)
	const [cameraProducer, setCameraProducer] =
		useState<mediasoupClient.types.Producer | null>(null)
	const [screenProducer, setScreenProducer] =
		useState<mediasoupClient.types.Producer | null>(null)
	const [localStream, setLocalStream] = useState<MediaStream | null>(null)

	const deviceRef = useRef<mediasoupClient.Device>(null)
	const consumersRef = useRef<mediasoupClient.types.Consumer[]>([])
	const audioElementsRef = useRef<HTMLAudioElement[]>([])
	const videoElementsRef = useRef<HTMLVideoElement[]>([])
	const videoIndexRef = useRef<number>(0)

	useEffect(() => {
		initDevice()
	}, [])

	useEffect(() => {
		const container = createFixedDisplay()
		container.onclick = () => {
			if (videoElementsRef.current.length === 0) return
			videoIndexRef.current =
				(videoIndexRef.current + 1) % videoElementsRef.current.length
			updateDisplayedVideo(videoElementsRef.current, videoIndexRef.current)
		}
	}, [])

	async function initDevice() {
		const device = deviceRef.current ?? new mediasoupClient.Device()
		if (!device.loaded) {
			const routerRtpCapabilities = await new Promise<RtpCapabilities>(
				(resolve) => socket.emit('call_getRouterRtpCapabilities', resolve)
			)
			await device.load({ routerRtpCapabilities })
		}
		deviceRef.current = device
	}

	function toggleMic() {
		if (!voiceProducer) return
		setIsMicOn((prev) => {
			prev ? voiceProducer.pause() : voiceProducer.resume()
			return !prev
		})
	}

	async function toggleCamera() {
		if (!cameraProducer) {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true })
			const track = stream.getVideoTracks()[0]
			if (!sendTransport) return
			const newCameraProducer = await sendTransport.produce({ track })

			const video = document.createElement('video')
			video.srcObject = new MediaStream([track])
			appendVideoElement(video)

			videoElementsRef.current.push(video)
			updateDisplayedVideo(videoElementsRef.current, videoIndexRef.current)

			setCameraProducer(newCameraProducer)
			setIsCameraOn(true)
		} else {
			setIsCameraOn((prev) => {
				prev ? cameraProducer.pause() : cameraProducer.resume()
				return !prev
			})
		}
	}

	async function toggleScreen() {
		if (!screenProducer) {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			})
			const track = stream.getVideoTracks()[0]
			if (!sendTransport) return
			const newScreenProducer = await sendTransport.produce({ track })

			const video = document.createElement('video')
			video.srcObject = new MediaStream([track])
			appendVideoElement(video)

			videoElementsRef.current.push(video)
			updateDisplayedVideo(videoElementsRef.current, videoIndexRef.current)

			track.onended = () => {
				setIsScreenOn(false)
				newScreenProducer.close()
				setScreenProducer(null)
			}

			setScreenProducer(newScreenProducer)
			setIsScreenOn(true)
		} else {
			setIsScreenOn((prev) => {
				prev ? screenProducer.pause() : screenProducer.resume()
				return !prev
			})
		}
	}

	async function startCalling(callId: string) {
		if (!deviceRef.current?.loaded) {
			await initDevice()
			return
		}

		const transportInfo = await new Promise<
			VoiceTransportOptions | { error: string }
		>((resolve) => socket.emit('call_createTransport', 'send', resolve))
		if ('error' in transportInfo) return

		const newSendTransport =
			deviceRef.current.createSendTransport(transportInfo)
		newSendTransport.on('connect', ({ dtlsParameters }, callback) => {
			socket.emit('call_connectTransport', { dtlsParameters, type: 'send' })
			callback()
		})
		newSendTransport.on(
			'produce',
			async ({ kind, rtpParameters }, callback) => {
				socket.emit(
					'call_produce',
					{ kind, rtpParameters, callId },
					({ id }) => {
						callback({ id })
					}
				)
			}
		)

		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
			},
		})
		const track = stream.getAudioTracks()[0]
		const newVoiceProducer = await newSendTransport.produce({ track })
		isMicOn ? newVoiceProducer.resume() : newVoiceProducer.pause()

		const recvTransportInfo = await new Promise<
			VoiceTransportOptions | { error: string }
		>((resolve) => socket.emit('call_createTransport', 'recv', resolve))
		if ('error' in recvTransportInfo) return

		const newRecvTransport =
			deviceRef.current.createRecvTransport(recvTransportInfo)
		newRecvTransport.on('connect', ({ dtlsParameters }, callback) => {
			socket.emit('call_connectTransport', { dtlsParameters, type: 'recv' })
			callback()
		})

		socket.off('call_newProducer')
		socket.on('call_newProducer', ({ producerId, kind }) => {
			if (!deviceRef.current?.loaded) return
			socket.emit(
				'call_consume',
				{
					producerId,
					callId,
					kind,
					rtpCapabilities: deviceRef.current.rtpCapabilities,
				},
				async (consumerParams) => {
					if ('error' in consumerParams) return
					const consumer = await newRecvTransport.consume(consumerParams)
					await consumer.resume()
					consumersRef.current.push(consumer)

					const newLocalStream = new MediaStream()
					newLocalStream.addTrack(consumer.track)

					if (consumer.kind === 'video') {
						const video = document.createElement('video')
						video.srcObject = newLocalStream
						appendVideoElement(video)

						videoElementsRef.current.push(video)
						updateDisplayedVideo(
							videoElementsRef.current,
							videoIndexRef.current
						)
					} else if (consumer.kind === 'audio') {
						const audio = document.createElement('audio')
						audio.srcObject = newLocalStream
						audio.autoplay = true
						audio.controls = true
						audio.hidden = true
						document.body.appendChild(audio)
						audioElementsRef.current.push(audio)
					}

					setLocalStream(newLocalStream)
				}
			)
		})

		setSendTransport(newSendTransport)
		setRecvTransport(newRecvTransport)
		setVoiceProducer(newVoiceProducer)
		setCallId(callId)
	}

	function stopCalling() {
		sendTransport?.close()
		recvTransport?.close()
		voiceProducer?.close()
		cameraProducer?.close()
		screenProducer?.close()
		consumersRef.current.forEach((c) => c.close())
		audioElementsRef.current.forEach((el) => {
			el.pause()
			el.srcObject = null
			el.remove()
		})
		videoElementsRef.current.forEach((el) => {
			el.pause()
			el.srcObject = null
			el.remove()
		})
		document.getElementById('video-display')?.remove()

		setSendTransport(null)
		setRecvTransport(null)
		setVoiceProducer(null)
		setCameraProducer(null)
		setScreenProducer(null)
		consumersRef.current.length = 0
		audioElementsRef.current.length = 0
		videoElementsRef.current.length = 0
		socket.off('call_newProducer')

		localStream?.getTracks().forEach((t) => t.stop())
		setLocalStream(null)
	}

	async function getJoinList() {
		if (!callId) return []
		const result = await new Promise<PeerState[] | { error: string }>(
			(resolve) => socket.emit('call_getPeerStates', callId, resolve)
		)
		return 'error' in result ? [] : result
	}

	if (callType === 'only-voice') {
		return { startCalling, stopCalling, getJoinList, toggleMic, isMicOn }
	} else if (callType === 'only-camera') {
		return { startCalling, stopCalling, getJoinList, toggleCamera, isCameraOn }
	} else if (callType === 'only-screen') {
		return { startCalling, stopCalling, getJoinList, toggleScreen, isScreenOn }
	} else {
		return {
			startCalling,
			stopCalling,
			getJoinList,
			toggleMic,
			isMicOn,
			toggleCamera,
			isCameraOn,
			toggleScreen,
			isScreenOn,
		}
	}
}

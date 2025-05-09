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

	async function initDevice() {
		let device = deviceRef.current ?? new mediasoupClient.Device()

		if (!device.loaded) {
			const routerRtpCapabilities = await new Promise<RtpCapabilities>(
				(resolve) => {
					socket.emit('call_getRouterRtpCapabilities', (res) => resolve(res))
				}
			)

			await device.load({ routerRtpCapabilities })
		}

		deviceRef.current = device
	}

	useEffect(() => {
		initDevice()
	}, [])

	function toggleMic() {
		if (!voiceProducer) {
			console.warn('⚠️ producer가 아직 생성되지 않았습니다.')
			return
		}

		setIsMicOn((prev) => {
			if (prev) {
				voiceProducer.pause()
				console.log('🔇 마이크 음소거됨')
			} else {
				voiceProducer.resume()
				console.log('🎙️ 마이크 음소거 해제됨')
			}
			return !prev
		})
	}

	async function toggleCamera() {
		if (!cameraProducer) {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true })
			const track = stream.getVideoTracks()[0]

			if (!sendTransport) {
				console.log('먼저 방에 입장해주세요')
				return
			}

			const newCameraProducer = await sendTransport.produce({ track })

			const video = document.createElement('video')
			video.srcObject = new MediaStream([track])
			video.autoplay = true
			video.playsInline = true
			video.muted = true // 본인 카메라 미리보기 시 무조건 muted 필요

			// 여기 바꿔
			document.body.appendChild(video)
			videoElementsRef.current.push(video)

			setCameraProducer(newCameraProducer)
			setIsCameraOn(true)

			console.log('📷 카메라 켜짐')
		} else {
			setIsCameraOn((prev) => {
				if (prev) {
					cameraProducer.pause()
					console.log('📷 카메라 꺼짐')
				} else {
					cameraProducer.resume()
					console.log('📷 카메라 다시 켜짐')
				}
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

			if (!sendTransport) {
				console.log('먼저 방에 입장해주세요')
				return
			}

			const newScreenProducer = await sendTransport.produce({ track })

			const video = document.createElement('video')
			video.srcObject = new MediaStream([track])
			video.autoplay = true
			video.playsInline = true
			video.muted = true // 본인 카메라 미리보기 시 무조건 muted 필요

			// 여기 바꿔
			document.body.appendChild(video)
			videoElementsRef.current.push(video)

			track.onended = () => {
				setIsScreenOn(false)
				newScreenProducer.close()
				setScreenProducer(null)
			}

			setScreenProducer(newScreenProducer)
			setIsCameraOn(true)
			console.log('📷 화면공유 켜짐')
		} else {
			setIsScreenOn((prev) => {
				if (prev) {
					screenProducer.pause()
					console.log('📷 화면공유 꺼짐')
				} else {
					screenProducer.resume()
					console.log('📷 화면공유 다시 켜짐')
				}
				return !prev
			})
		}
	}

	async function startCalling(callId: string) {
		if (!deviceRef.current || !deviceRef.current.loaded) {
			await initDevice()
			return
		}
		// [3] 서버에 송신용 transport 요청
		const transportInfo = await new Promise<
			| VoiceTransportOptions
			| {
					error: string
			  }
		>((resolve) => {
			socket.emit('call_createTransport', 'send', (res) => resolve(res))
		})

		if ('error' in transportInfo) {
			console.error('❌ Transport 생성 실패:', transportInfo.error)
			return
		}

		// [4] 클라이언트 측 sendTransport 생성
		const newSendTransport = deviceRef.current.createSendTransport({
			id: transportInfo.id,
			iceParameters: transportInfo.iceParameters,
			iceCandidates: transportInfo.iceCandidates,
			dtlsParameters: transportInfo.dtlsParameters,
		})

		// [5] DTLS 연결 완료 시 서버에 연결 요청
		newSendTransport.on('connect', ({ dtlsParameters }, callback) => {
			socket.emit('call_connectTransport', { dtlsParameters, type: 'send' })
			callback()
		})

		// [6] produce 이벤트 발생 시 서버에 음성 producer 생성 요청
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

		// [7] 사용자의 마이크에서 오디오 track 가져오기
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		const track = stream.getAudioTracks()[0]

		// [8] 오디오 트랙을 sendTransport에 연결하여 전송 시작
		const newVoiceProducer = await newSendTransport.produce({ track })

		if (isMicOn) {
			await newVoiceProducer.resume()
		} else {
			await newVoiceProducer.pause()
		}

		// [9] 서버에 수신용 transport도 별도로 요청
		const recvTransportInfo = await new Promise<
			| VoiceTransportOptions
			| {
					error: string
			  }
		>((resolve) => {
			socket.emit('call_createTransport', 'recv', (res) => resolve(res))
		})

		if ('error' in recvTransportInfo) {
			console.error('❌ Transport 생성 실패:', recvTransportInfo.error)
			return
		}

		// [10] 클라이언트 측 recvTransport 생성
		const newRecvTransport: mediasoupClient.types.Transport =
			deviceRef.current.createRecvTransport({
				id: recvTransportInfo.id,
				iceParameters: recvTransportInfo.iceParameters,
				iceCandidates: recvTransportInfo.iceCandidates,
				dtlsParameters: recvTransportInfo.dtlsParameters,
			})

		// [11] 수신용 transport 연결 시 서버에 알림
		newRecvTransport.on('connect', ({ dtlsParameters }, callback) => {
			socket.emit('call_connectTransport', { dtlsParameters, type: 'recv' })
			callback()
		})

		// [12] 상대방이 새로운 producer를 생성했을 때 수신 처리
		socket.off('call_newProducer')
		socket.on('call_newProducer', ({ producerId, kind }) => {
			// [13] 서버에 해당 producer를 consume 요청
			if (!deviceRef.current || !deviceRef.current.loaded) return
			socket.emit(
				'call_consume',
				{
					producerId,
					callId,
					kind,
					rtpCapabilities: deviceRef.current.rtpCapabilities,
				},
				async (consumerParams) => {
					// [14] consumer 객체 생성
					if ('error' in consumerParams) {
						console.error('오디오 수신 실패:', consumerParams.error)
						return
					}
					const consumer = await newRecvTransport.consume({
						id: consumerParams.id,
						producerId: consumerParams.producerId,
						kind: consumerParams.kind,
						rtpParameters: consumerParams.rtpParameters,
					})

					await consumer.resume()
					consumersRef.current.push(consumer)

					// [15] 스트림에 트랙 연결
					const newLocalStream = new MediaStream()
					newLocalStream.addTrack(consumer.track)

					if (consumer.kind === 'video') {
						const video = document.createElement('video')
						video.srcObject = newLocalStream
						video.autoplay = true
						video.playsInline = true
						video.controls = true
						// 여기 바꿔
						document.getElementById('videoContainer')?.appendChild(video)

						videoElementsRef.current.push(video)
					} else if (consumer.kind === 'audio') {
						const audio = document.createElement('audio')
						audio.srcObject = newLocalStream
						audio.autoplay = true
						audio.controls = true
						audio.hidden = true
						// 여기 바꿔
						document.body.appendChild(audio)
						audioElementsRef.current.push(audio)
					}

					setLocalStream(newLocalStream)
				}
			)
		})

		socket.on('call_peerLeft', (peer) => {})

		setSendTransport(newSendTransport)
		setRecvTransport(newRecvTransport)
		setVoiceProducer(newVoiceProducer)
		setCallId(callId)
	}

	function stopCalling() {
		console.log('🔴 통화 종료 시작')

		try {
			sendTransport?.close()
			recvTransport?.close()
			voiceProducer?.close()
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

			// 리셋
			setSendTransport(null)
			setRecvTransport(null)
			setVoiceProducer(null)
			setCameraProducer(null)
			setScreenProducer(null)
			consumersRef.current.length = 0
			audioElementsRef.current.length = 0

			socket.off('call_newProducer') // 핸들러가 함수형이라 제거 가능
			console.log('✅ 통화 종료 완료')
			if (localStream) {
				localStream.getTracks().forEach((t) => t.stop())
				setLocalStream(null)
			}
		} catch (e) {
			console.error('통화 종료 중 오류', e)
		}
	}

	async function getJoinList() {
		if (callId) {
			const profiles = await new Promise<PeerState[] | { error: string }>(
				(resolve) =>
					socket.emit('call_getPeerStates', callId, (peers) => resolve(peers))
			)

			if ('error' in profiles) {
				return []
			}

			return profiles
		}

		return []
	}

	if (callType === 'only-voice') {
		return {
			startCalling,
			stopCalling,
			getJoinList,
			toggleMic,
			isMicOn,
		}
	} else if (callType === 'only-camera') {
		return {
			startCalling,
			stopCalling,
			getJoinList,
			toggleCamera,
			isCameraOn,
		}
	} else if (callType === 'only-screen') {
		return {
			startCalling,
			stopCalling,
			getJoinList,
			toggleScreen,
			isScreenOn,
		}
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

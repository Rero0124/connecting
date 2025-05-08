import { types as mediasoupTypes } from 'mediasoup'
import { RtpCapabilities } from 'mediasoup/types'
import {
	DtlsParameters,
	IceCandidate,
	IceParameters,
	MediaKind,
	RtpParameters,
} from 'mediasoup-client/types'
import { DmMessage } from '../../lib/schemas/dm.schema'
import { RoomMessage } from '@prisma/client'
import { Server, Socket } from 'socket.io'

export type SocketServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	any,
	SocketData
>

export type SocketSocekt = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	any,
	SocketData
>

export interface SocektGlobalData {
	socketMap: Map<number, string>
	worker: mediasoupTypes.Worker
	router: mediasoupTypes.Router
	sendTransports: Record<string, mediasoupTypes.WebRtcTransport>
	recvTransports: Record<string, mediasoupTypes.WebRtcTransport>
	producers: Record<string, mediasoupTypes.Producer[]>
	peerStates: Record<string, PeerState>
}

export interface VoiceTransportOptions {
	id: string
	iceParameters: IceParameters
	iceCandidates: IceCandidate[]
	dtlsParameters: DtlsParameters
}

interface VoiceProduceOptions {
	kind: 'audio' | 'video'
	rtpParameters: any
}

interface VoiceConsumeRequest {
	producerId: string
	callId: string
	kind: MediaKind
	rtpCapabilities: RtpCapabilities
}

export interface PeerState {
	profileId: number
	isMicOn: boolean
	isCameraOn: boolean
	isScreenOn: boolean
}

type VoiceConsumeResponse =
	| {
			id: string
			producerId: string
			kind: MediaKind
			rtpParameters: RtpParameters
	  }
	| { error: string }

export interface ServerToClientEvents {
	get_profileId: () => void
	loggedIn_sameProfile: () => void
	update_profile: () => void
	update_rooms: () => void
	update_dmSessions: () => void
	update_friends: () => void
	update_friendRequests: () => void
	received_dmMessage: (dmMessage: DmMessage) => void
	received_roomMessage: (roomMessage: RoomMessage) => void
	call_newProducer: (data: {
		producerId: string
		socketId: string
		kind: MediaKind
	}) => void
	call_peerStateUpdated: (socketId: string, state: Partial<PeerState>) => void
	call_peerLeft: (peer: Partial<PeerState>) => void
}

export interface ClientToServerEvents {
	set_profileId: (profileId: number) => void
	update_profile: (profileIds: number[]) => void
	update_rooms: (profileIds: number[]) => void
	update_dmSessions: (profileIds: number[]) => void
	update_friends: (profileIds: number[]) => void
	update_friendRequests: (profileIds: number[]) => void
	send_dmMessage: (dmMessage: DmMessage, profileIds: number[]) => void
	send_roomMessage: (roomMessage: RoomMessage, profileIds: number[]) => void
	call_createTransport: (
		type: 'send' | 'recv',
		callback: (params: VoiceTransportOptions | { error: string }) => void
	) => void
	call_connectTransport: (data: {
		dtlsParameters: DtlsParameters
		type: 'send' | 'recv'
	}) => void
	call_produce: (
		data: VoiceProduceOptions & { callId: string },
		callback: (data: { id: string }) => void
	) => void
	call_getRouterRtpCapabilities: (
		callback: (routerRtpCapabilities: RtpCapabilities) => void
	) => void
	call_consume: (
		data: VoiceConsumeRequest,
		callback: (response: VoiceConsumeResponse) => void
	) => void
	call_updatePeerState: (
		state: Partial<PeerState>,
		callback: () => void
	) => void
	call_getPeerStates: (
		callId: string,
		callback: (peers: PeerState[] | { error: string }) => void
	) => void
}

export interface SocketData {
	profileId?: number
	callId?: string
}

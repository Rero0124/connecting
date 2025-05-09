import { z } from 'zod'

export const TransportTypeSchema = z.union([
	z.literal('send'),
	z.literal('recv'),
])

export const PeerStateSchema = z.object({
	profileId: z.number(),
	isMicOn: z.boolean(),
	isCameraOn: z.boolean(),
	isScreenOn: z.boolean(),
})

export const MediaKindSchema = z.union([z.literal('audio'), z.literal('video')])

export const RtpHeaderExtensionUriSchema = z.union([
	z.literal('urn:ietf:params:rtp-hdrext:sdes:mid'),
	z.literal('urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id'),
	z.literal('urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id'),
	z.literal('http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07'),
	z.literal('urn:ietf:params:rtp-hdrext:framemarking'),
	z.literal('urn:ietf:params:rtp-hdrext:ssrc-audio-level'),
	z.literal('urn:3gpp:video-orientation'),
	z.literal('urn:ietf:params:rtp-hdrext:toffset'),
	z.literal(
		'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01'
	),
	z.literal('http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time'),
	z.literal('http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time'),
	z.literal('http://www.webrtc.org/experiments/rtp-hdrext/playout-delay'),
])

export const RtpCapabilitiesSchema = z.object({
	codecs: z
		.array(
			z.object({
				kind: MediaKindSchema,
				mimeType: z.string(),
				preferredPayloadType: z.number().optional(),
				clockRate: z.number(),
				channels: z.number().optional(),
				parameters: z.any().optional(),
				rtcpFeedback: z
					.array(
						z.object({
							type: z.string(),
							parameter: z.string().optional(),
						})
					)
					.optional(),
			})
		)
		.optional(),
	headerExtensions: z
		.array(
			z.object({
				kind: MediaKindSchema,
				uri: RtpHeaderExtensionUriSchema,
				preferredId: z.number(),
				preferredEncrypt: z.boolean().optional(),
				direction: z
					.union([
						z.literal('sendrecv'),
						z.literal('sendonly'),
						z.literal('recvonly'),
						z.literal('inactive'),
					])
					.optional(),
			})
		)
		.optional(),
})

export const RtpParametersSchema = z.object({
	mid: z.string().optional(),
	codecs: z.array(
		z.object({
			mimeType: z.string(),
			payloadType: z.number(),
			clockRate: z.number(),
			channels: z.number().optional(),
			parameters: z.any().optional(),
			rtcpFeedback: z
				.array(
					z.object({
						type: z.string(),
						parameter: z.string().optional(),
					})
				)
				.optional(),
		})
	),
	headerExtensions: z
		.array(
			z.object({
				uri: RtpHeaderExtensionUriSchema,
				id: z.number(),
				encrypt: z.boolean().optional(),
				parameters: z.any().optional(),
			})
		)
		.optional(),
	encodings: z
		.array(
			z.object({
				ssrc: z.number().optional(),
				rid: z.string().optional(),
				codecPayloadType: z.number().optional(),
				rtx: z
					.object({
						ssrc: z.number(),
					})
					.optional(),
				dtx: z.boolean().optional(),
				scalabilityMode: z.string().optional(),
				scaleResolutionDownBy: z.number().optional(),
				maxBitrate: z.number().optional(),
				maxFramerate: z.number().optional(),
				adaptivePtime: z.boolean().optional(),
				priority: z
					.union([
						z.literal('very-low'),
						z.literal('low'),
						z.literal('medium'),
						z.literal('high'),
					])
					.optional(),
				networkPriority: z
					.union([
						z.literal('very-low'),
						z.literal('low'),
						z.literal('medium'),
						z.literal('high'),
					])
					.optional(),
			})
		)
		.optional(),
	rtcp: z
		.object({
			cname: z.string().optional(),
			reducedSize: z.boolean().optional(),
			mux: z.boolean().optional(),
		})
		.optional(),
})

export const DtlsParametersSchema = z.object({
	role: z
		.union([z.literal('auto'), z.literal('client'), z.literal('server')])
		.optional(),
	fingerprints: z.array(
		z.object({
			algorithm: z.union([
				z.literal('sha-1'),
				z.literal('sha-224'),
				z.literal('sha-256'),
				z.literal('sha-384'),
				z.literal('sha-512'),
			]),
			value: z.string(),
		})
	),
})

export const VoiceTransportOptionsSchema = z.object({
	id: z.string(),
	iceParameters: z.object({
		usernameFragment: z.string(),
		password: z.string(),
		iceLite: z.boolean().optional(),
	}),
	iceCandidates: z.array(
		z.object({
			foundation: z.string(),
			priority: z.number(),
			address: z.string(),
			ip: z.string(),
			protocol: z.union([z.literal('udp'), z.literal('tcp')]),
			port: z.number(),
			type: z.union([
				z.literal('host'),
				z.literal('srflx'),
				z.literal('prflx'),
				z.literal('relay'),
			]),
			tcpType: z
				.union([z.literal('active'), z.literal('passive'), z.literal('so')])
				.optional(),
		})
	),
	dtlsParameters: DtlsParametersSchema,
})

export const VoiceProduceOptionsSchema = z.object({
	kind: MediaKindSchema,
	rtpParameters: RtpParametersSchema,
})

export const VoiceConsumeRequestSchema = z.object({
	producerId: z.string(),
	callId: z.string(),
	kind: MediaKindSchema,
	rtpCapabilities: RtpCapabilitiesSchema,
})

export const VoiceConsumeResponseSchema = z.union([
	z.object({
		id: z.string(),
		producerId: z.string(),
		kind: MediaKindSchema,
		rtpParameters: RtpParametersSchema,
	}),
	z.object({ error: z.string() }),
])

export type TransportType = z.infer<typeof TransportTypeSchema>

export type PeerState = z.infer<typeof PeerStateSchema>

export type MediaKind = z.infer<typeof MediaKindSchema>

export type RtpHeaderExtensionUri = z.infer<typeof RtpHeaderExtensionUriSchema>

export type RtpCapabilities = z.infer<typeof RtpCapabilitiesSchema>

export type RtpParameters = z.infer<typeof RtpParametersSchema>

export type DtlsParameters = z.infer<typeof DtlsParametersSchema>

export type VoiceTransportOptions = z.infer<typeof VoiceTransportOptionsSchema>

export type VoiceProduceOptions = z.infer<typeof VoiceProduceOptionsSchema>

export type VoiceConsumeRequest = z.infer<typeof VoiceConsumeRequestSchema>

export type VoiceConsumeResponse = z.infer<typeof VoiceConsumeResponseSchema>

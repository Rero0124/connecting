import { ContentType, IconType } from '@prisma/client'
import { z } from 'zod'
import { SuccessResponse } from './api.schema'

export const RoomSchema = z.object({
	id: z.string(),
	name: z.string(),
	masterProfileId: z.number(),
	iconType: z.nativeEnum(IconType),
	iconData: z.string(),
	createdAt: z.coerce.date(),
})

export const RoomMessageSchema = z.object({
	profile: z.object({
		name: z.string().nullable(),
		tag: z.string(),
		image: z.string(),
	}),
	id: z.number(),
	roomId: z.string(),
	profileId: z.number(),
	sentAt: z.coerce.date(),
	content: z.string(),
	contentType: z.nativeEnum(ContentType),
	isPinned: z.boolean(),
	updatedAt: z.coerce.date().nullable(),
})

export const RoomParticipantSchema = z.object({
	id: z.number(),
	joinedAt: z.coerce.date(),
	profileId: z.number(),
	roomId: z.string(),
})

export const RoomJoinCodeSchema = z.object({
	id: z.number(),
	code: z.string(),
	roomId: z.string(),
	authorProfileId: z.number(),
	expiresAt: z.coerce.date(),
})

export const GetRoomsResponseSchema = z.array(RoomSchema)

export const GetRoomParamsSchema = z.object({
	roomId: z.string(),
})

export const GetRoomResponseSchema = RoomSchema.merge(
	z.object({
		message: z.array(RoomMessageSchema),
	})
)

export const GetRoomParticipantsParamsSchema = z.object({
	roomId: z.string(),
})

export const GetRoomParticipantsResponseSchema = z.array(RoomParticipantSchema)

export const GetRoomJoinCodesParamsSchema = z.object({
	roomId: z.string(),
})

export const GetRoomJoinCodesResponseSchema = z.array(RoomJoinCodeSchema)

export const UpdateRoomParamsSchema = z.object({
	roomId: z.string(),
})

export const UpdateRoomBodySchema = z.object({
	name: z.string().optional(),
	iconType: z.nativeEnum(IconType).optional(),
	iconData: z.string().optional(),
})

export const CreateRoomBodySchema = z.object({
	name: z.string(),
	iconType: z.nativeEnum(IconType),
	iconData: z.string(),
})

export const CreateRoomParticipantParamsSchema = z.object({
	roomId: z.string(),
})

export const CreateRoomParticipantBodySchema = z.object({
	joinCode: z.string(),
})

export const CreateRoomMessageParamsSchema = z.object({
	roomId: z.string(),
})

export const CreateRoomMessageBodySchema = z.object({
	message: z.string(),
})

export const CreateRoomJoinCodeParamsSchema = z.object({
	roomId: z.string(),
})

export const CreateRoomJoinCodeBodySchema = z.object({
	expiresAt: z.coerce.date(),
})

export const CreateRoomJoinCodeResponseSchema = RoomJoinCodeSchema

export const DeleteRoomParamsSchema = z.object({
	roomId: z.string(),
})

export const DeleteRoomParticipantParamsSchema = z.object({
	roomId: z.string(),
	profileId: z.coerce.number(),
})

export const DeleteRoomJoinCodeParamsSchema = z.object({
	roomId: z.string(),
	code: z.string(),
})

export type Room = z.infer<typeof RoomSchema>
export type RoomMessage = z.infer<typeof RoomMessageSchema>
export type RoomParticipant = z.infer<typeof RoomParticipantSchema>
export type RoomJoinCode = z.infer<typeof RoomJoinCodeSchema>

export type GetRoomsResponse = z.infer<typeof GetRoomsResponseSchema>
export type GetRoomsSuccessResponse = SuccessResponse<
	typeof GetRoomsResponseSchema
>

export type GetRoomParams = z.infer<typeof GetRoomParamsSchema>
export type GetRoomResponse = z.infer<typeof GetRoomResponseSchema>
export type GetRoomSuccessResponse = SuccessResponse<
	typeof GetRoomResponseSchema
>

export type GetRoomParticipantsParams = z.infer<
	typeof GetRoomParticipantsParamsSchema
>
export type GetRoomParticipantsResponse = z.infer<
	typeof GetRoomParticipantsResponseSchema
>
export type GetRoomParticipantsSuccessResponse = SuccessResponse<
	typeof GetRoomParticipantsResponseSchema
>

export type GetRoomJoinCodesParams = z.infer<
	typeof GetRoomJoinCodesParamsSchema
>
export type GetRoomJoinCodesResponse = z.infer<
	typeof GetRoomJoinCodesResponseSchema
>
export type GetRoomJoinCodesSuccessResponse = SuccessResponse<
	typeof GetRoomJoinCodesResponseSchema
>

export type UpdateRoomParams = z.infer<typeof UpdateRoomParamsSchema>
export type UpdateRoomBody = z.infer<typeof UpdateRoomBodySchema>

export type CreateRoomBody = z.infer<typeof CreateRoomBodySchema>

export type CreateRoomParticipantParams = z.infer<
	typeof CreateRoomParticipantParamsSchema
>
export type CreateRoomParticipantBody = z.infer<
	typeof CreateRoomParticipantBodySchema
>

export type CreateRoomMessageParams = z.infer<
	typeof CreateRoomMessageParamsSchema
>
export type CreateRoomMessageBody = z.infer<typeof CreateRoomMessageBodySchema>

export type CreateRoomJoinCodeParams = z.infer<
	typeof CreateRoomJoinCodeParamsSchema
>
export type CreateRoomJoinCodeBody = z.infer<
	typeof CreateRoomJoinCodeBodySchema
>
export type CreateRoomJoinCodeResponse = z.infer<
	typeof CreateRoomJoinCodeResponseSchema
>
export type CreateRoomJoinCodeSuccessResponse = SuccessResponse<
	typeof CreateRoomJoinCodeResponseSchema
>

export type DeleteRoomParams = z.infer<typeof DeleteRoomParamsSchema>

export type DeleteRoomParticipantParams = z.infer<
	typeof DeleteRoomParticipantParamsSchema
>

export type DeleteRoomJoinCodeParams = z.infer<
	typeof DeleteRoomJoinCodeParamsSchema
>

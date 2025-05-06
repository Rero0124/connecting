import { ContentType, IconType } from '@prisma/client'
import { z } from 'zod'
import { SuccessResponse } from './api.schema'

export const DmSessionSchema = z.object({
	id: z.string(),
	name: z.string(),
	iconType: z.nativeEnum(IconType),
	iconData: z.string(),
	createdAt: z.coerce.date(),
})

export const DmMessageSchema = z.object({
	profile: z.object({
		name: z.string().nullable(),
		tag: z.string(),
		image: z.string(),
	}),
	id: z.number(),
	dmSessionId: z.string(),
	profileId: z.number(),
	sentAt: z.coerce.date(),
	content: z.string(),
	contentType: z.nativeEnum(ContentType),
	isPinned: z.boolean(),
	updatedAt: z.coerce.date().nullable(),
})

export const DmParticipantSchema = z.object({
	id: z.number(),
	isNotAllowed: z.boolean(),
	joinedAt: z.coerce.date(),
	profileId: z.number(),
	dmSessionId: z.string(),
})

export const GetDmSessionsResponseSchema = z.object({
	allowedDmSessions: z.array(DmSessionSchema),
	notAllowedDmSessions: z.array(DmSessionSchema),
})

export const GetDmSessionParamsSchema = z.object({
	dmSessionId: z.string(),
})

export const GetDmSessionResponseSchema = DmSessionSchema.merge(
	z.object({
		message: z.array(DmMessageSchema),
	})
)

export const GetDmParticipantsParamsSchema = z.object({
	dmSessionId: z.string(),
})

export const GetDmParticipantsResponseSchema = z.array(DmParticipantSchema)

export const CreateDmSessionBodySchema = z.object({
	name: z.string(),
	iconType: z.nativeEnum(IconType),
	iconData: z.string(),
	participants: z.array(z.number()),
})

export const CreateDmParticipantParamsSchema = z.object({
	dmSessionId: z.string(),
})

export const CreateDmParticipantBodySchema = z.object({
	profileId: z.number(),
})

export const CreateDmMessageParamsSchema = z.object({
	dmSessionId: z.string(),
})

export const CreateDmMessageBodySchema = z.object({
	message: z.string(),
})

export const DeleteDmParticipantParamsSchema = z.object({
	dmSessionId: z.string(),
	profileId: z.coerce.number(),
})

export type DmSession = z.infer<typeof DmSessionSchema>
export type DmMessage = z.infer<typeof DmMessageSchema>
export type DmParticipant = z.infer<typeof DmParticipantSchema>

export type GetDmSessionsResponse = z.infer<typeof GetDmSessionsResponseSchema>
export type GetDmSessionsSuccessResponse = SuccessResponse<
	typeof GetDmSessionsResponseSchema
>

export type GetDmSessionParams = z.infer<typeof GetDmSessionParamsSchema>
export type GetDmSessionResponse = z.infer<typeof GetDmSessionResponseSchema>
export type GetDmSessionSuccessResponse = SuccessResponse<
	typeof GetDmSessionResponseSchema
>

export type GetDmParticipantsParams = z.infer<
	typeof GetDmParticipantsParamsSchema
>
export type GetDmParticipantsResponse = z.infer<
	typeof GetDmParticipantsResponseSchema
>
export type GetDmParticipantsSuccessResponse = SuccessResponse<
	typeof GetDmParticipantsResponseSchema
>

export type CreateDmSessionBody = z.infer<typeof CreateDmSessionBodySchema>

export type CreateDmParticipantParams = z.infer<
	typeof CreateDmParticipantParamsSchema
>
export type CreateDmParticipantBody = z.infer<
	typeof CreateDmParticipantBodySchema
>

export type CreateDmMessageParams = z.infer<typeof CreateDmMessageParamsSchema>
export type CreateDmMessageBody = z.infer<typeof CreateDmMessageBodySchema>

export type DeleteDmParticipantParams = z.infer<
	typeof DeleteDmParticipantParamsSchema
>

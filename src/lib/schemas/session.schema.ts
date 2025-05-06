import { z } from 'zod'
import { SuccessResponse } from './api.schema'

export const SessionSchema = z
	.object({
		userId: z.number(),
		profileId: z.number(),
		expiresAt: z.coerce.date(),
	})
	.optional()

export const VerifySessionSchema = z.discriminatedUnion('isAuth', [
	z.object({
		isAuth: z.literal(false),
	}),
	z.object({
		isAuth: z.literal(true),
		userId: z.number(),
		profileId: z.number(),
	}),
])

export const GetSessionResponseSchema = VerifySessionSchema

export type Session = z.infer<typeof SessionSchema>

export type VerifySession = z.infer<typeof VerifySessionSchema>
export type VerifySessionSuccessResponse = SuccessResponse<
	typeof VerifySessionSchema
>

export type GetSessionResponse = z.infer<typeof GetSessionResponseSchema>
export type GetSessionSuccessResponse = SuccessResponse<
	typeof GetSessionResponseSchema
>

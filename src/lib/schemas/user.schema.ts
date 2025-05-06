import { z } from 'zod'
import { SuccessResponse } from './api.schema'

export const UserSchema = z.object({
	email: z.string(),
})

export const SessionUserSchema = z.object({
	userId: z.number(),
	email: z.string(),
})

export const GetUserParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const GetUserResponseSchema = UserSchema

export const UpdateUserParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const UpdateUserBodySchema = z.object({
	email: z.string(),
})

export const DeleteUserParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const UpdateUserPasswordParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const UpdateUserPasswordBodySchema = z.object({
	password: z.string(),
})

export const UserResponseSchema = UserSchema

export type User = z.infer<typeof UserSchema>

export type SessionUser = z.infer<typeof SessionUserSchema>
export type SessionUserSuccessResponse = SuccessResponse<
	typeof SessionUserSchema
>

export type GetUserParams = z.infer<typeof GetUserParamsSchema>
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>
export type GetUserSuccessResponse = SuccessResponse<
	typeof GetUserResponseSchema
>

export type UpdateUserParams = z.infer<typeof UpdateUserParamsSchema>
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>

export type DeleteUserParams = z.infer<typeof DeleteUserParamsSchema>

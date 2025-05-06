import { z } from 'zod'
import { ProfileSchema } from './profile.schema'
import { SuccessResponse } from './api.schema'

export const AuthLoginInputSchema = z.object({
	profileId: z.coerce.number(),
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
	password: z.string().trim(),
})

export const AuthLoginBodySchema = z.object({
	profileId: z.coerce.number(),
	email: z.string().email().trim(),
	password: z.string().trim(),
})

export const AuthGetProfilesInputSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
	password: z.string().trim(),
})

export const AuthGetProfilesBodySchema = z.object({
	email: z.string().email().trim(),
	password: z.string().trim(),
})

export const AuthGetProfilesResponseSchema = z.array(ProfileSchema)

export const AuthJoinInputSchema = z.object({
	tag: z.string().trim(),
	name: z
		.string()
		.min(2, { message: 'Name must be at least 2 characters long.' })
		.trim(),
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
	password: z
		.string()
		.min(8, { message: 'Be at least 8 characters long' })
		.regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
		.regex(/[0-9]/, { message: 'Contain at least one number.' })
		.regex(/[^a-zA-Z0-9]/, {
			message: 'Contain at least one special character.',
		})
		.trim(),
})

export const AuthJoinBodySchema = z.object({
	tag: z.string().trim(),
	name: z.string().min(2).trim(),
	email: z.string().email().trim(),
	password: z
		.string()
		.min(8)
		.regex(/[a-zA-Z]/)
		.regex(/[0-9]/)
		.regex(/[^a-zA-Z0-9]/)
		.trim(),
})

export const AuthChangeProfileBodySchema = z.object({
	profileId: z.number(),
})

export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>
export type AuthLoginBody = z.infer<typeof AuthLoginBodySchema>

export type AuthGetProfilesInput = z.infer<typeof AuthGetProfilesInputSchema>
export type AuthGetProfilesBody = z.infer<typeof AuthGetProfilesBodySchema>
export type AuthGetProfilesResponse = z.infer<
	typeof AuthGetProfilesResponseSchema
>
export type AuthGetProfilesSuccessResponse = SuccessResponse<
	typeof AuthGetProfilesResponseSchema
>

export type AuthJoinInput = z.infer<typeof AuthJoinInputSchema>
export type AuthJoinBody = z.infer<typeof AuthJoinBodySchema>

export type AuthChangeProfileBody = z.infer<typeof AuthChangeProfileBodySchema>

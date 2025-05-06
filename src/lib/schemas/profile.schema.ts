import { z } from 'zod'
import { SuccessResponse } from './api.schema'
import { FilterType, StatusType } from '@prisma/client'

export const ProfileSchema = z.object({
	id: z.number(),
	image: z.string(),
	tag: z.string(),
	name: z.string().nullable(),
	statusType: z.nativeEnum(StatusType),
	statusId: z.number(),
	information: z.string(),
	isCompany: z.boolean(),
	isOnline: z.boolean(),
	createdAt: z.coerce.date(),
})

export const ProfileFilterSchema = z.object({
	id: z.number(),
	profileId: z.number(),
	filterProfileId: z.number(),
	filterType: z.nativeEnum(FilterType),
	profile: ProfileSchema,
})

export const SessionProfileSchema = z.object({
	userId: z.number(),
	profileId: z.number(),
	tag: z.string(),
})

export const GetProfilesResponseSchema = z.array(ProfileSchema)

export const GetProfileParamsSchema = z.object({
	tag: z.string(),
})

export const GetProfileResponseSchema = ProfileSchema

export const GetProfilesByUserParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const GetProfilesByUserResponseSchema = z.array(ProfileSchema)

export const GetProfileByUserParamsSchema = z.object({
	userId: z.coerce.number(),
	profileId: z.coerce.number(),
})
export const GetProfileByUserResponseSchema = ProfileSchema

export const GetProfileFiltersResponseSchema = z.array(ProfileFilterSchema)

export const UpdateProfileByUserParamsSchema = z.object({
	userId: z.coerce.number(),
	profileId: z.coerce.number(),
})

export const UpdateProfileByUserBodySchema = z.object({
	name: z.string().optional(),
	tag: z.string().optional(),
	image: z.string().optional(),
	information: z.string().optional(),
	statusType: z.nativeEnum(StatusType).optional(),
	statusId: z.number().optional(),
})

export const CreateProfileByUserParamsSchema = z.object({
	userId: z.coerce.number(),
})

export const CreateProfileByUserBodySchema = z.object({
	name: z.string(),
	tag: z.string(),
	image: z.string(),
	information: z.string(),
	statusType: z.nativeEnum(StatusType),
	statusId: z.number(),
})

export const CreateProfileFilterBodySchema = z.object({
	profileId: z.number(),
	filterType: z.nativeEnum(FilterType),
})

export const DeleteProfileByUserParamsSchema = z.object({
	userId: z.coerce.number(),
	profileId: z.coerce.number(),
})

export const DeleteProfileFilterParamsSchema = z.object({
	filterId: z.coerce.number(),
})

export type Profile = z.infer<typeof ProfileSchema>

export type ProfileFilter = z.infer<typeof ProfileFilterSchema>

export type SessionProfile = z.infer<typeof SessionProfileSchema>
export type SessionProfileSuccessResponse = SuccessResponse<
	typeof SessionProfileSchema
>

export type GetProfilesSuccessResponse = SuccessResponse<
	typeof GetProfilesResponseSchema
>

export type GetProfileParams = z.infer<typeof GetProfileParamsSchema>
export type GetProfileSuccessResponse = SuccessResponse<
	typeof GetProfileResponseSchema
>

export type GetProfilesByUserParams = z.infer<
	typeof GetProfilesByUserParamsSchema
>
export type GetProfilesByUserResponse = z.infer<
	typeof GetProfilesByUserResponseSchema
>
export type GetProfilesByUserSuccessResponse = SuccessResponse<
	typeof GetProfilesByUserResponseSchema
>

export type GetProfileByUserParams = z.infer<
	typeof GetProfileByUserParamsSchema
>
export type GetProfileByUserResponse = z.infer<
	typeof GetProfileByUserResponseSchema
>
export type GetProfileByUserSuccessResponse = SuccessResponse<
	typeof GetProfileByUserResponseSchema
>

export type GetProfileFiltersResponse = z.infer<
	typeof GetProfileFiltersResponseSchema
>
export type GetProfileFiltersSuccessResponse = SuccessResponse<
	typeof GetProfileFiltersResponseSchema
>

export type UpdateProfileByUserParams = z.infer<
	typeof UpdateProfileByUserParamsSchema
>
export type UpdateProfileByUserBody = z.infer<
	typeof UpdateProfileByUserBodySchema
>

export type CreateProfileByUserParams = z.infer<
	typeof CreateProfileByUserParamsSchema
>
export type CreateProfileByUserBody = z.infer<
	typeof CreateProfileByUserBodySchema
>

export type CreateProfileFilterBody = z.infer<
	typeof CreateProfileFilterBodySchema
>

export type DeleteProfileFilterParams = z.infer<
	typeof DeleteProfileFilterParamsSchema
>

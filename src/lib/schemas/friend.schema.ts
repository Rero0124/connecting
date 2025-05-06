import { z } from 'zod'
import { ProfileSchema } from './profile.schema'
import { SuccessResponse } from './api.schema'

export const FriendSchema = ProfileSchema

export const FriendRequestSchema = z.object({
	id: z.number(),
	sentAt: z.coerce.date(),
	profileId: z.number(),
	profile: ProfileSchema,
})

export const GetFriendsResponseSchema = z.array(FriendSchema)

export const GetFriendRequestsResponseSchema = z.object({
	receivedFriendRequests: z.array(FriendRequestSchema),
	sentFriendRequests: z.array(FriendRequestSchema),
})

export const UpdateFriendRequestParamsSchema = z.object({
	requestId: z.coerce.number(),
})
export const UpdateFriendRequestBodySchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('accept') }),
	z.object({ type: z.literal('cancel') }),
])

export const CreateFriendRequestBodySchema = z.object({
	tag: z.string(),
})

export const DeleteFriendParamsSchema = z.object({
	tag: z.string(),
})

export const DeleteFriendRequestParamsSchema = z.object({
	requestId: z.coerce.number(),
})

export type Friend = z.infer<typeof FriendSchema>
export type FriendRequest = z.infer<typeof FriendRequestSchema>

export type GetFriendsResponse = z.infer<typeof GetFriendsResponseSchema>
export type GetFriendsSuccessResponse = SuccessResponse<
	typeof GetFriendsResponseSchema
>

export type GetFriendRequestsResponse = z.infer<
	typeof GetFriendRequestsResponseSchema
>
export type GetFriendRequestsSuccessResponse = SuccessResponse<
	typeof GetFriendRequestsResponseSchema
>

export type UpdateFriendRequestParams = z.infer<
	typeof UpdateFriendRequestParamsSchema
>
export type UpdateFriendRequestBody = z.infer<
	typeof UpdateFriendRequestBodySchema
>

export type CreateFriendRequestBody = z.infer<
	typeof CreateFriendRequestBodySchema
>

export type DeleteFriendParams = z.infer<typeof DeleteFriendParamsSchema>

export type DeleteFriendRequestParams = z.infer<
	typeof DeleteFriendRequestParamsSchema
>

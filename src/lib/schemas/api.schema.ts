import { z } from 'zod'

export const ApiResponseSchema = z.object({
	status: z.union([z.literal('success'), z.literal('error')]),
	code: z.number(),
	message: z.string(),
	data: z.any().optional(),
})

export function SuccessResponseSchema<T extends z.ZodTypeAny>(
	dataSchema: T
): z.ZodObject<{
	status: z.ZodLiteral<'success'>
	code: z.ZodNumber
	message: z.ZodString
	data: T
}>

export function SuccessResponseSchema(): z.ZodObject<{
	status: z.ZodLiteral<'success'>
	code: z.ZodNumber
	message: z.ZodString
}>

export function SuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema?: T) {
	return z.object({
		status: z.literal('success'),
		code: z.number(),
		message: z.string(),
		...(dataSchema ? { data: dataSchema } : {}),
	}) as any
}

export const ErrorResponseSchema = z.object({
	status: z.literal('error'),
	code: z.number(),
	message: z.string(),
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>

export type SuccessResponse<T extends z.ZodTypeAny | undefined = undefined> =
	T extends z.ZodTypeAny
		? z.infer<ReturnType<typeof SuccessResponseSchema<T>>>
		: z.infer<ReturnType<typeof SuccessResponseSchema>>

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

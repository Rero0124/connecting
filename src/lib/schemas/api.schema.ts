import 'zod-openapi/extend'
import { z } from 'zod'
import { ZodOpenApiPathsObject } from 'zod-openapi'

export const ApiResponseSchema = z
	.object({
		status: z.union([z.literal('success'), z.literal('error')]),
		code: z.coerce.number(),
		message: z.string(),
		data: z.any().optional(),
	})
	.openapi({
		title: 'API 응답',
		description: 'API 응답 기본 형식입니다.',
	})

export function SuccessResponseSchema(): z.ZodObject<{
	status: z.ZodLiteral<'success'>
	code: z.ZodNumber
	message: z.ZodString
}>
export function SuccessResponseSchema<T extends z.ZodType>(
	dataSchema: T
): z.ZodObject<{
	status: z.ZodLiteral<'success'>
	code: z.ZodNumber
	message: z.ZodString
	data: T
}>

export function SuccessResponseSchema<T extends z.ZodType | undefined>(
	dataSchema?: T
) {
	return dataSchema
		? (z.object({
				status: z.literal('success'),
				code: z.coerce.number(),
				message: z.string(),
				data: dataSchema,
			}) as unknown as any)
		: (z.object({
				status: z.literal('success'),
				code: z.coerce.number(),
				message: z.string(),
			}) as unknown as any)
}

export const ErrorResponseSchema = z
	.object({
		status: z.literal('error'),
		code: z.number(),
		message: z.string(),
	})
	.openapi({
		title: 'API Error 응답',
		description: 'API Error 응답 형식',
		example: {
			status: 'error',
			code: 400,
			message: '잘못된 요청입니다.',
		},
	})

export type ApiResponse = z.output<typeof ApiResponseSchema>

export type SuccessResponse<T extends z.ZodTypeAny | undefined = undefined> =
	T extends z.ZodTypeAny
		? z.output<ReturnType<typeof SuccessResponseSchema<T>>>
		: z.output<ReturnType<typeof SuccessResponseSchema>>

export type ErrorResponse = z.output<typeof ErrorResponseSchema>

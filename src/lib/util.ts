import { z } from 'zod'
import {
	ApiResponseSchema,
	ErrorResponse,
	ErrorResponseSchema,
	SuccessResponse,
	SuccessResponseSchema,
} from './schemas/api.schema'
import { VerifySession, VerifySessionSchema } from './schemas/session.schema'

export type SerializeDatesForRedux<T> = {
	[K in keyof T]: K extends `${string}At`
		? T[K] extends Date
			? string
			: T[K]
		: T[K] extends object
			? SerializeDatesForRedux<T[K]>
			: T[K]
}

export function serializeDatesForRedux<T>(obj: T): SerializeDatesForRedux<T> {
	return JSON.parse(
		JSON.stringify(obj, (key, value) => {
			if (key.endsWith('At') && value instanceof Date) {
				return value.toISOString()
			}
			return value
		})
	)
}

export function deserializeDatesFromRedux<T>(
	obj: SerializeDatesForRedux<T>
): T {
	return JSON.parse(
		JSON.stringify(obj, (key, value) => {
			if (
				key.endsWith('At') &&
				typeof value === 'string' &&
				!isNaN(Date.parse(value))
			) {
				return new Date(value)
			}
			return value
		})
	)
}

export async function fetchWithValidation<
	T extends z.ZodTypeAny | undefined = undefined,
	Body extends z.ZodTypeAny | undefined = undefined,
>(
	url: string | URL | globalThis.Request,
	options?: Omit<RequestInit, 'body'> & {
		dataSchema?: T
		bodySchema?: Body
	} & (Body extends z.ZodTypeAny
			? { body: z.infer<Body> }
			: { body?: BodyInit | null })
): Promise<
	| (T extends z.ZodTypeAny ? SuccessResponse<T> : SuccessResponse)
	| ErrorResponse
> {
	try {
		const { dataSchema, bodySchema, body, ...fetchOptions } = options ?? {}

		let validateBody = body
		if (bodySchema) {
			validateBody = await bodySchema.parseAsync(body)
		}

		const res = await fetch(url, {
			...fetchOptions,
			body: JSON.stringify(validateBody),
		})

		const json = await res.json()

		const apiResponse = await ApiResponseSchema.parseAsync(json)

		if (apiResponse.status === 'success') {
			if (options?.dataSchema) {
				return SuccessResponseSchema(options.dataSchema).parseAsync(
					apiResponse
				) as any
			} else {
				return SuccessResponseSchema().parseAsync(apiResponse) as any
			}
		} else {
			return ErrorResponseSchema.parseAsync(apiResponse)
		}
	} catch {
		return {
			status: 'error',
			code: 0x0,
			message: '올바르지 않은 응답 형식 입니다.',
		}
	}
}

export function promiseAll<T extends any[]>(values: {
	[K in keyof T]: Promise<T[K]>
}): Promise<T> {
	return Promise.all(values) as Promise<T>
}

export function getCookieValue(name: string) {
	const regex = new RegExp(`(^| )${name}=([^;]+)`)
	if (typeof document !== 'undefined') {
		const match = document.cookie.match(regex)
		if (match) {
			return match[2]
		}
	}
}

export async function getSession(): Promise<VerifySession> {
	const sessionResponse = await fetchWithValidation('/api/session', {
		dataSchema: VerifySessionSchema,
	})
	if (sessionResponse.status === 'error') {
		return {
			isAuth: false,
		}
	} else {
		return sessionResponse.data
	}
}

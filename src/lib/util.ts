import { z } from 'zod'
import {
	ApiResponseSchema,
	ErrorResponse,
	ErrorResponseSchema,
	SuccessResponse,
	SuccessResponseSchema,
} from './schemas/api.schema'

export type SerializeData<T extends object> = {
	[K in keyof T]: T[K] extends Date
		? string
		: T[K] extends bigint
			? string
			: T[K] extends object
				? SerializeData<T[K]>
				: T[K]
}

export function serializeData<T extends object>(obj: T): SerializeData<T>
export function serializeData<T extends object>(obj: T[]): SerializeData<T>[]
export function serializeData<T extends object>(
	obj: T
): SerializeData<T> | SerializeData<T>[] {
	const replacer = (item: T) =>
		JSON.parse(
			JSON.stringify(item, (key, value) => {
				if (value instanceof Date) {
					return value.toISOString()
				} else if (isBigInt(value)) {
					return value.toString()
				}
				return value
			})
		)
	if (Array.isArray(obj)) {
		return obj.map((item) => replacer(item))
	}

	return replacer(obj)
}

export function deserializeData<T extends object>(obj: SerializeData<T>): T {
	return JSON.parse(
		JSON.stringify(obj, (key, value) => {
			if (
				key.endsWith('At') &&
				typeof value === 'string' &&
				!isNaN(Date.parse(value))
			) {
				return new Date(value)
			} else if ((key === 'id' || key.endsWith('Id')) && isBigInt(value)) {
				return toBigInt(value)
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

export function mergeRefs<T>(
	...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
	return (element) => {
		refs.forEach((ref) => {
			if (!ref) return
			if (typeof ref === 'function') {
				ref(element)
			} else if (typeof ref === 'object' && ref !== null) {
				;(ref as React.RefObject<T | null>).current = element
			}
		})
	}
}

export function isBigInt(value: any): value is bigint {
	try {
		BigInt(value)
		return true
	} catch {
		return false
	}
}

export function toBigInt(value: any): bigint | null {
	try {
		return BigInt(value)
	} catch {
		return null
	}
}

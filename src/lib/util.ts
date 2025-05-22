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
			: T[K] extends (infer U)[]
				? U extends Record<string, unknown>
					? SerializeData<U>[]
					: U[]
				: T[K] extends Record<string, unknown>
					? SerializeData<T[K]>
					: T[K]
}

export function serializeData<T extends object>(obj: T): SerializeData<T>
export function serializeData<T extends object>(obj: T[]): SerializeData<T>[]
export function serializeData<T extends object>(
	obj: T
): SerializeData<T> | SerializeData<T>[] {
	const replacer = (value: any): any => {
		if (value instanceof Date) return value.toISOString()
		if (typeof value === 'bigint') return value.toString()
		if (Array.isArray(value)) return value.map(replacer)
		if (value && typeof value === 'object') {
			return Object.fromEntries(
				Object.entries(value).map(([k, v]) => [k, replacer(v)])
			)
		}
		return value
	}

	return Array.isArray(obj) ? obj.map(replacer) : replacer(obj)
}

export function deserializeData<T extends object>(obj: SerializeData<T>): T
export function deserializeData<T extends object>(obj: SerializeData<T>[]): T[]
export function deserializeData<T extends object>(
	obj: SerializeData<T> | SerializeData<T>[]
): T | T[] {
	const parser = (item: any) => {
		const result: Record<string, unknown> = {}

		for (const [key, value] of Object.entries(item)) {
			if (
				key.endsWith('At') &&
				typeof value === 'string' &&
				!isNaN(Date.parse(value))
			) {
				result[key] = new Date(value).toISOString()
			} else if ((key === 'id' || key.endsWith('Id')) && isBigInt(value))
				result[key] = toBigInt(value)
			else if (Array.isArray(value)) result[key] = value.map(parser)
			else if (value && typeof value === 'object') result[key] = parser(value)
			else result[key] = value
		}
		return result
	}

	return Array.isArray(obj) ? (obj.map(parser) as T[]) : (parser(obj) as T)
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
	(T extends undefined ? SuccessResponse : SuccessResponse<T>) | ErrorResponse
> {
	try {
		const { dataSchema, bodySchema, body, ...fetchOptions } = options ?? {}

		let validateBody = body
		if (bodySchema) {
			validateBody = await bodySchema.parseAsync(body)
		}

		const res = await fetch(url, {
			...fetchOptions,
			body: JSON.stringify(serializeData(validateBody)),
		})

		const json = await res.json()

		const deserializeJson = deserializeData(json)

		const apiResponse = await ApiResponseSchema.parseAsync(deserializeJson)

		if (apiResponse.status === 'success') {
			if (options?.dataSchema) {
				return (await SuccessResponseSchema(options.dataSchema).parseAsync(
					apiResponse
				)) as unknown as any
			} else {
				return (await SuccessResponseSchema().parseAsync(
					apiResponse
				)) as unknown as any
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

import { z } from 'zod'

export const LoginFormSchema = z.object({
	profileId: z
		.string()
		.transform((v) => (v === '' ? undefined : v))
		.optional()
		.refine((v) => v === undefined || !isNaN(Number(v)), {
			message: 'Number Invalide',
		})
		.transform((v) => (v === undefined ? 0 : Number(v))),
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
	password: z.string().trim(),
})

export const JoinFormSchema = z.object({
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

export type LoginFormState =
	| {
			data?: {
				email?: string
				password?: string
			}
			errors?: {
				email?: string[]
				password?: string[]
			}
			message?: string
			isLogin?: boolean
			profiles?: {
				tag: string
				name: string | null
				id: number
				userId: number
				statusType: string
				statusId: number
				information: string
				image: string
				isCompany: boolean
				isOnline: boolean
				createdAt: Date
			}[]
	  }
	| undefined

export type JoinFormState =
	| {
			data?: {
				tag?: string
				name?: string
				email?: string
				password?: string
			}
			errors?: {
				name?: string[]
				email?: string[]
				password?: string[]
			}
			message?: string
	  }
	| undefined

export type SessionPayload =
	| {
			userId: number
			profileId?: number
			expiresAt: Date
	  }
	| undefined

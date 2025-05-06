import { Profile } from '../schemas/profile.schema'

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
			profiles?: Profile[]
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
			isJoin?: boolean
	  }
	| undefined

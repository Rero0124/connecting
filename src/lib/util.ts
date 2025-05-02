import { ErrorResponse, SuccessResponse } from '../types/api'
import { VerifySessionType } from './session'

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

export async function getSession(): Promise<
	| {
			isLogin: false
	  }
	| {
			isLogin: true
			authType: 'user'
			userId: number
	  }
	| {
			isLogin: true
			authType: 'profile'
			userId: number
			profileId: number
	  }
> {
	const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse =
		await fetch('/api/session').then((res) => res.json())
	if (
		sessionResponse.status === 'error' ||
		sessionResponse.data.authType === 'none'
	) {
		return {
			isLogin: false,
		}
	} else {
		if (sessionResponse.data.authType === 'user') {
			return {
				isLogin: true,
				authType: 'user',
				userId: sessionResponse.data.userId,
			}
		} else {
			return {
				isLogin: true,
				authType: 'profile',
				userId: sessionResponse.data.userId,
				profileId: sessionResponse.data.profileId,
			}
		}
	}
}

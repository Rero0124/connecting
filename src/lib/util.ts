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

export type SessionType =
	| {
			isAuth: false
	  }
	| {
			isAuth: true
			userId: number
			profileId: number
	  }

export async function getSession(): Promise<VerifySessionType> {
	const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse =
		await fetch('/api/session').then((res) => res.json())
	if (sessionResponse.status === 'error' || !sessionResponse.data.isAuth) {
		return {
			isAuth: false,
		}
	} else {
		return {
			isAuth: true,
			userId: sessionResponse.data.userId,
			profileId: sessionResponse.data.profileId,
		}
	}
}

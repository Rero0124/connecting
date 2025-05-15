'use client'

import { VerifySession, VerifySessionSchema } from './schemas/session.schema'
import { fetchWithValidation } from './util'

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

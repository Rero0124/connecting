import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from '@/src/lib/definitions'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
	try {
		const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
			algorithms: ['HS256'],
		})
		return payload
	} catch (error) {}
}

export async function createSession(userId: number, profileId: number) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	const session = await encrypt({ userId, expiresAt, profileId })
	const cookieStore = await cookies()

	cookieStore.set('session', session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	})
}

export async function deleteSession() {
	const cookieStore = await cookies()
	cookieStore.delete('session')
}

export async function verifySession(): Promise<
	{ isAuth: true; userId: number; profileId: number } | { isAuth: false }
> {
	const cookie = (await cookies()).get('session')?.value
	const session = await decrypt(cookie)

	if (session && new Date(session.expiresAt) > new Date()) {
		await createSession(session.userId, session.profileId)
		return {
			isAuth: true,
			userId: session.userId,
			profileId: session.profileId,
		}
	} else {
		await deleteSession()
		return { isAuth: false }
	}
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/src/lib/session'

// 1. Specify protected and public routes
const protectedRoutes: string[] = []
const authRoutes: string[] = ['/login', '/join']

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname
	const isProtectedRoute = protectedRoutes.includes(path)
	const isAuthRoute = authRoutes.includes(path)

	const cookie = (await cookies()).get('session')?.value
	const session = await decrypt(cookie)

	if (!isAuthRoute && !session?.profileId) {
		return NextResponse.redirect(new URL('/login', req.nextUrl))
	}

	// 5. Redirect to /dashboard if the user is authenticated
	if (isAuthRoute && session?.profileId) {
		return NextResponse.redirect(new URL('/', req.nextUrl))
	}

	return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

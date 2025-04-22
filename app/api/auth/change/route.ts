import prisma from '@/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import { LoginFormSchema } from '@/lib/definitions'
import { createSession, verifySession } from '@/lib/session'

export async function POST(request: NextRequest) {
	try {
		const sessionCheck = await verifySession()

		if (!sessionCheck.isAuth) {
			return NextResponse.json(
				{ error: '먼저 로그인을 해주세요' },
				{ status: 401 }
			)
		}

		const data = await request.json()

		if (!data.profileId || isNaN(Number(data.profileId))) {
			return NextResponse.json(
				{ message: '입력값 형식이 잘못되었습니다.' },
				{ status: 400 }
			)
		}

		const profileId = Number(data.profileId)

		const userProfile = await prisma.userProfile.findUnique({
			where: {
				id: profileId,
				userId: sessionCheck.userId,
			},
		})

		if (!userProfile) {
			return NextResponse.json(
				{ result: false, message: '존재하지 않는 프로필 id입니다.' },
				{ status: 400 }
			)
		} else {
			await createSession(sessionCheck.userId, profileId)
			return NextResponse.json({ result: true, message: '' }, { status: 200 })
		}
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

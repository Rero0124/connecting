import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ tag: string }> }
) {
	const { tag } = await params
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json(
				{ error: '먼저 로그인을 해주세요' },
				{ status: 401 }
			)
		}
		const users = await prisma.userProfile.findMany({
			where: {
				userTag: {
					startsWith: tag,
				},
				userFriends: {
					some: {
						userProfileId: sessionCheck.profileId,
					},
				},
			},
		})
		return NextResponse.json(users, { status: 200 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

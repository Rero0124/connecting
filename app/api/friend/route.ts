import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json(
				{ error: '먼저 로그인을 해주세요' },
				{ status: 401 }
			)
		}

		const friends = await prisma.userProfile.findMany({
			select: {
				userTag: true,
				userName: true,
				image: true,
				createdAt: true,
			},
			where: {
				userFriends: {
					some: {
						userProfile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
		})

		return NextResponse.json(friends)
	} catch {
		return NextResponse.json({})
	}
}

export async function POST(request: NextRequest) {}

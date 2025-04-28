import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
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

		const messages = await prisma.message.findMany({
			where: {
				messageUser: {
					some: {
						userProfile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
		})

		return NextResponse.json(messages, { status: 200 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	const data: {
		profileData?: string
		name?: string
		userProfileIds?: number[]
	} = await request.json()
	try {
		if (!data || !data.profileData || !data.name || !data.userProfileIds)
			return NextResponse.json(
				{ message: '인자가 올바르지 않습니다.' },
				{ status: 400 }
			)
		const room = await prisma.message.create({
			data: {
				profileType: 'image',
				profileData: data.profileData,
				name: data.name,
				messageUser: {
					createMany: {
						data: data.userProfileIds.map((userProfileId) => ({
							userProfileId: userProfileId,
						})),
					},
				},
			},
		})

		return NextResponse.json(room, { status: 204 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

export async function DELETE() {
	try {
		return NextResponse.json({})
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

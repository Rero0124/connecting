import prisma from '@/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ tag: string }> }
) {
	const { tag } = await params
	try {
		const tagCount = await prisma.userProfile.count({
			where: {
				userTag: tag,
			},
		})
		return NextResponse.json({ isUsed: tagCount > 0 }, { status: 200 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

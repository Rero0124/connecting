import prisma from "@/lib/prisma"
import { verifySession } from "@/lib/session";
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession();
		if(sessionCheck.isAuth) { 
			const userProfiles = await prisma.userProfile.findUnique({
				where: {
					userId: sessionCheck.userId,
					id: sessionCheck.profileId
				},
				select: {
					id: true,
          userTag: true,
          userName: true,
          isCompany: true,
          information: true,
          image: true,
          createdAt: true
				}
			})
			return NextResponse.json(userProfiles ?? undefined, { status: 200 })
		} else {
			return NextResponse.json({ message: '로그인을 먼저 해주세요' }, { status: 401 })
		}
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const sessionCheck = await verifySession();
		if(sessionCheck.isAuth) { 
			const userProfiles = await prisma.userProfile.findMany({
				where: {
					userId: sessionCheck.userId,
					id: sessionCheck.profileId
				},
				select: {
					id: true,
          userTag: true,
          userName: true,
          isCompany: true,
          information: true,
          image: true,
          createdAt: true
				}
			})
			return NextResponse.json(userProfiles ?? undefined, { status: 200 })
		} else {
			return NextResponse.json({ message: '로그인을 먼저 해주세요' }, { status: 401 })
		}
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
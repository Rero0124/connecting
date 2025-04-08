import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const sessionCheck = await verifySession();
		if(!sessionCheck.isAuth) {
			return NextResponse.json({ error: '먼저 로그인을 해주세요' }, { status: 401 })
		}

		const rooms = await prisma.room.findMany({
			where: {
				roomUser: {
					some: {
						userId: sessionCheck.userId
					}
				}
			}
		})
		
		return NextResponse.json(rooms, { status: 200 })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function POST() {
	try {
		return NextResponse.json({})
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function DELETE() {
	try {
		return NextResponse.json({})
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
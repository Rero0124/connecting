import prisma from "@/lib/prisma"
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sessionCheck = await verifySession();
    if(!sessionCheck.isAuth) {
      return NextResponse.json({ error: '먼저 로그인을 해주세요' }, { status: 401 })
    }

    const friends = await prisma.user.findMany({
      where: {
        userFriends: {
          some: {
            userId: sessionCheck.userId
          }
        }
      }
    })

    return NextResponse.json(friends)
  } catch {
    return NextResponse.json({})
  }
}
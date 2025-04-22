import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const users = await prisma.user.findMany()
		return NextResponse.json(users)
	} catch {
		return NextResponse.json({})
	}
}

import { NextResponse } from 'next/server'

export async function GET() {
	try {
		return NextResponse.json({})
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

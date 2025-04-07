import prisma from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import bcryptjs from "bcryptjs"
import { JoinFormSchema } from "@/lib/definitions";

export async function POST(request: NextRequest) {
	try {
		const rawData = await request.json();
		const validatedFields = JoinFormSchema.safeParse({
			name: rawData.name,
			email: rawData.email,
			password: rawData.password
		})

		if(!validatedFields.success) {
			return NextResponse.json({ message: '입력값 형식이 잘못되었습니다.' }, { status: 400 })
		}
	
		const { name, email, password } = validatedFields.data!

		const hashedPassword = await bcryptjs.hash(password, 10)

		await prisma.user.create({
			data: { name, email, password: hashedPassword }
		})

		return NextResponse.json({ status: 200 })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
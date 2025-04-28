import prisma from '@/src/lib/prisma'
import { NextResponse, type NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { JoinFormSchema } from '@/src/lib/definitions'

export async function POST(request: NextRequest) {
	let user
	try {
		const rawData = await request.json()
		const validatedFields = JoinFormSchema.safeParse({
			tag: rawData.tag,
			name: rawData.name,
			email: rawData.email,
			password: rawData.password,
		})

		if (!validatedFields.success) {
			return NextResponse.json(
				{ message: '입력값 형식이 잘못되었습니다.' },
				{ status: 400 }
			)
		}

		const { tag, name, email, password } = validatedFields.data!

		const hashedPassword = await bcryptjs.hash(password, 10)

		user = await prisma.user.create({
			data: { email, password: hashedPassword },
		})

		await prisma.userProfile.create({
			data: {
				userTag: tag,
				userId: user.id,
				userName: name,
			},
		})

		return NextResponse.json({ status: 200 })
	} catch {
		if (user) {
			await prisma.user.delete({
				where: {
					id: user.id,
				},
			})
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

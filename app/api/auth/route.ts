import prisma from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import bcryptjs from "bcryptjs"
import { LoginFormSchema } from "@/lib/definitions"
import { createSession, deleteSession, verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession();
		const statusCode = sessionCheck.isAuth ? 200 : 401
		const message = sessionCheck.isAuth ? '' : '로그인을 먼저 해주세요'

		return NextResponse.json({ isAuth: sessionCheck.isAuth, message: message }, { status: statusCode })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const rawData = await request.json();
		const validatedFields = LoginFormSchema.safeParse({
			email: rawData.email,
			password: rawData.password
		})

		if(!validatedFields.success) {
			return NextResponse.json({ message: '입력값 형식이 잘못되었습니다.' }, { status: 400 })
		}
 
		const { email, password } = validatedFields.data
		
		const user = await prisma.user.findUnique({
			where: { email }
		})
		
		let statusCode = 403;
		let message = '이메일 또는 비밀번호가 일치하지 않습니다.';
		let passwordCheck = false;

		if(user) {
			passwordCheck = bcryptjs.compareSync(password, user.password)
			if(passwordCheck) {
				statusCode = 200;
				message = '';
				await createSession(user.id)
			}
		}

		return NextResponse.json({ result: passwordCheck, message: message }, { status: statusCode })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function DELETE() {
	try {
		await deleteSession();
		return NextResponse.json({}, { status: 200 })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
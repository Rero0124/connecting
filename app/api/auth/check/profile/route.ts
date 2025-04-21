import prisma from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import bcryptjs from "bcryptjs"
import { LoginFormSchema } from "@/lib/definitions"
import { verifySession } from "@/lib/session";

export async function GET(request: NextRequest) {
	try {
		const sessionCheck = await verifySession();
			
		if(!sessionCheck.isAuth) {
      return NextResponse.json({ error: '먼저 로그인을 해주세요' }, { status: 401 })
    }
		
		const profiles = await prisma.userProfile.findMany({
			where: { 
				userId: sessionCheck.userId
			}
		})

		return NextResponse.json({ result: true, message: '', profiles: profiles }, { status: 200 })
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
		let profiles = undefined;

		if(user) {
			passwordCheck = bcryptjs.compareSync(password, user.password)
			if(passwordCheck) {
				message = '프로필이 없습니다.';

				profiles = await prisma.userProfile.findMany({
					where: { 
						userId: user.id
					}
				})

				if(profiles.length > 0) {
					statusCode = 200;
					message = '';
				}
			}
		}

		return NextResponse.json({ result: passwordCheck, message: message, profiles: profiles }, { status: statusCode })
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
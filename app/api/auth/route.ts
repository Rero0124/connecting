import prisma from "@/lib/prisma";
import {NextResponse, type NextRequest} from "next/server";
import bcryptjs from "bcryptjs";
import {LoginFormSchema} from "@/lib/definitions";
import {createSession, deleteSession, verifySession} from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();
        if (sessionCheck.isAuth) {
            return NextResponse.json(
                {isAuth: sessionCheck.isAuth, userId: sessionCheck.userId, profileId: sessionCheck.profileId},
                {status: 200}
            );
        } else {
            return NextResponse.json({isAuth: false, message: "로그인을 먼저 해주세요"}, {status: 401});
        }
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawData = await request.json();
        const validatedFields = LoginFormSchema.safeParse({
            profileId: rawData.profileId.toString(),
            email: rawData.email,
            password: rawData.password,
        });

        if (!validatedFields.success) {
            return NextResponse.json({message: "입력값 형식이 잘못되었습니다."}, {status: 400});
        }

        const {email, password, profileId} = validatedFields.data;

        const user = await prisma.user.findUnique({
            where: {email},
        });

        let statusCode = 403;
        let message = "이메일 또는 비밀번호가 일치하지 않습니다.";
        let passwordCheck = false;

        if (user) {
            passwordCheck = bcryptjs.compareSync(password, user.password);
            if (passwordCheck) {
                message = "프로필이 올바르지 않습니다.";

                const userProfile = await prisma.userProfile.findUnique({
                    where: {
                        id: profileId,
                        userId: user.id,
                    },
                });

                if (userProfile) {
                    statusCode = 200;
                    message = "";
                    await createSession(user.id, userProfile.id);
                }
            }
        }

        return NextResponse.json({result: passwordCheck, message: message}, {status: statusCode});
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function DELETE() {
    try {
        await deleteSession();
        return NextResponse.json({}, {status: 200});
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

import prisma from "@/lib/prisma";
import {verifySession} from "@/lib/session";
import {NextResponse, type NextRequest} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();
        if (sessionCheck.isAuth) {
            const userProfiles = await prisma.userProfile.findUnique({
                where: {
                    userId: sessionCheck.userId,
                    id: sessionCheck.profileId,
                },
                select: {
                    id: true,
                    userTag: true,
                    userName: true,
                    isCompany: true,
                    information: true,
                    image: true,
                    createdAt: true,
                },
            });
            return NextResponse.json(userProfiles ?? undefined, {status: 200});
        } else {
            return NextResponse.json({message: "로그인을 먼저 해주세요"}, {status: 401});
        }
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();
        if (sessionCheck.isAuth) {
            const userProfiles = await prisma.userProfile.findMany({
                where: {
                    userId: sessionCheck.userId,
                    id: sessionCheck.profileId,
                },
                select: {
                    id: true,
                    userTag: true,
                    userName: true,
                    isCompany: true,
                    information: true,
                    image: true,
                    createdAt: true,
                },
            });
            return NextResponse.json(userProfiles ?? undefined, {status: 200});
        } else {
            return NextResponse.json({message: "로그인을 먼저 해주세요"}, {status: 401});
        }
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();

        if (!sessionCheck.isAuth) {
            return NextResponse.json({error: "먼저 로그인을 해주세요."}, {status: 401});
        }

        const body = await request.json();
        const {userName, statusName, information, image} = body;

        const updateData: any = {};
        if (userName !== undefined && userName !== null) updateData.userName = userName;
        if (statusName !== undefined && statusName !== null) updateData.statusName = statusName;
        if (information !== undefined && information !== null) updateData.information = information;
        if (image !== undefined && image !== null) updateData.image = image;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({result: false, message: "변경할 항목이 없습니다."}, {status: 400});
        }

        const updatedProfile = await prisma.userProfile.update({
            where: {
                id: sessionCheck.profileId,
            },
            data: updateData,
        });

        return NextResponse.json({result: true, profile: updatedProfile}, {status: 200});
    } catch (err) {
        console.error("[PATCH /api/profile] Error:", err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

import prisma from "@/lib/prisma";
import {verifySession} from "@/lib/session";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();
        if (!sessionCheck.isAuth) {
            return NextResponse.json({error: "먼저 로그인을 해주세요"}, {status: 401});
        }

        const rawFilterUsers = await prisma.filterUser.findMany({
            where: {
                userProfileId: sessionCheck.profileId,
            },
            include: {
                filterProfile: true,
            },
        });

        const filterUsers = rawFilterUsers.map((rawFilterUser) => ({
            userTag: rawFilterUser.filterProfile.userTag,
            userName: rawFilterUser.filterProfile.userName ?? undefined,
            image: rawFilterUser.filterProfile.image,
            createdAt: rawFilterUser.filterProfile.createdAt,
            filterType: rawFilterUser.filterType,
        }));

        return NextResponse.json(filterUsers, {status: 200});
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

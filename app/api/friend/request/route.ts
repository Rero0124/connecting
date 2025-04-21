import prisma from "@/lib/prisma";
import {verifySession} from "@/lib/session";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const sessionCheck = await verifySession();
        if (!sessionCheck.isAuth) {
            return NextResponse.json({error: "먼저 로그인을 해주세요"}, {status: 401});
        }

        const rawSendAddFriends = await prisma.addFriends.findMany({
            where: {
                addFriendProfile: {
                    id: sessionCheck.profileId,
                },
            },
            include: {
                userProfile: {
                    select: {
                        userTag: true,
                        userName: true,
                        image: true,
                        createdAt: true,
                    },
                },
            },
        });

        const rawReceiveAddFriends = await prisma.addFriends.findMany({
            where: {
                userProfile: {
                    id: sessionCheck.profileId,
                },
            },
            include: {
                addFriendProfile: {
                    select: {
                        userTag: true,
                        userName: true,
                        image: true,
                        createdAt: true,
                    },
                },
            },
        });

        const sendAddFriends = rawSendAddFriends.map((rawSendFriend) => ({
            userTag: rawSendFriend.userProfile.userTag,
            userName: rawSendFriend.userProfile.userName ?? undefined,
            image: rawSendFriend.userProfile.image,
            createdAt: rawSendFriend.userProfile.createdAt,
        }));

        const receiveAddFriends = rawReceiveAddFriends.map((rawSendFriend) => ({
            userTag: rawSendFriend.addFriendProfile.userTag,
            userName: rawSendFriend.addFriendProfile.userName ?? undefined,
            image: rawSendFriend.addFriendProfile.image,
            createdAt: rawSendFriend.addFriendProfile.createdAt,
        }));

        return NextResponse.json({send: sendAddFriends, receive: receiveAddFriends}, {status: 200});
    } catch {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const {userTag} = await request.json();
        console.log("[POST /api/friend/request] 요청된 태그:", userTag);

        const sessionCheck = await verifySession();
        if (!sessionCheck.isAuth) {
            return NextResponse.json({error: "먼저 로그인을 해주세요"}, {status: 401});
        }

        const user = await prisma.userProfile.findUnique({
            where: {
                userTag: userTag,
            },
        });

        if (user) {
            await prisma.addFriends.create({
                data: {
                    userProfileId: user.id,
                    addFriendProfileId: sessionCheck.profileId,
                },
            });
            return NextResponse.json({result: true}, {status: 200});
        } else {
            return NextResponse.json({result: false, message: "존재하지 않는 유저입니다."}, {status: 400});
        }
    } catch (err) {
        console.error("[POST /api/friend/request] 서버 오류:", err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

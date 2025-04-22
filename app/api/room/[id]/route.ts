import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params
	try {
		const sessionCheck = await verifySession()
		if (!sessionCheck.isAuth) {
			return NextResponse.json(
				{ error: '먼저 로그인을 해주세요' },
				{ status: 401 }
			)
		}

		const rawRoomInfo = await prisma.room.findUnique({
			where: {
				id: id,
				roomUser: {
					some: {
						userProfile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
			include: {
				roomChat: {
					include: {
						sendedUserProfile: {
							select: {
								userTag: true,
								userName: true,
								image: true,
							},
						},
					},
				},
			},
		})

		if (!rawRoomInfo) {
			return NextResponse.json(
				{ result: false, message: '존재하지 메세지입니다.' },
				{ status: 400 }
			)
		}

		const messageInfo = {
			id: rawRoomInfo.id,
			name: rawRoomInfo.name,
			masterId: rawRoomInfo.masterId,
			profileType: rawRoomInfo.profileType,
			profileData: rawRoomInfo.profileData,
			chats: rawRoomInfo.roomChat.map((chat) => ({
				id: chat.id,
				sendedUserTag: chat.sendedUserProfile.userTag,
				sendedUserName: chat.sendedUserProfile.userName ?? undefined,
				sendedUserImage: chat.sendedUserProfile.image,
				contentType: chat.contentType,
				content: chat.content,
				isPinned: chat.isPinned,
				sendedAt: chat.sendedAt,
			})),
		}
		return NextResponse.json(messageInfo, { status: 200 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

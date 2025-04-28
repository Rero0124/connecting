import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
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

		const rawMessageInfo = await prisma.message.findUnique({
			where: {
				id: id,
				messageUser: {
					some: {
						userProfile: {
							id: sessionCheck.profileId,
							userId: sessionCheck.userId,
						},
					},
				},
			},
			include: {
				messageChat: {
					include: {
						sendedMessageUserProfile: {
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

		if (!rawMessageInfo) {
			return NextResponse.json(
				{ result: false, message: '존재하지 메세지입니다.' },
				{ status: 400 }
			)
		}

		const messageInfo = {
			id: rawMessageInfo.id,
			name: rawMessageInfo.name,
			profileType: rawMessageInfo.profileType,
			profileData: rawMessageInfo.profileData,
			chats: rawMessageInfo.messageChat.map((chat) => ({
				id: chat.id,
				sendedUserTag: chat.sendedMessageUserProfile.userTag,
				sendedUserName: chat.sendedMessageUserProfile.userName ?? undefined,
				sendedUserImage: chat.sendedMessageUserProfile.image,
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

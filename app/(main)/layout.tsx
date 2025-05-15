import prisma from '@/src/lib/prisma'
import { SocketProvider } from '../../src/provider/SocketProvider'
import { MainLayout } from '@/src/components/layout/MainLayout'
import { redirect } from 'next/navigation'
import { verifySession } from '@/src/lib/session'

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await verifySession(false)
	if (!session.isAuth) redirect('/login')
	const profile = await prisma.profile.findUnique({
		omit: {
			userId: true,
		},
		where: {
			id: session.profileId,
			userId: session.userId,
		},
	})

	if (!profile) redirect('/logout')

	const rooms = await prisma.room.findMany({
		where: {
			participant: {
				some: {
					profile: {
						id: session.profileId,
						userId: session.userId,
					},
				},
			},
		},
	})

	const allowedDmSessions = await prisma.dmSession.findMany({
		where: {
			participant: {
				some: {
					profile: {
						id: session.profileId,
						userId: session.userId,
					},
					isNotAllowed: false,
				},
			},
		},
	})

	const notAllowedDmSessions = await prisma.dmSession.findMany({
		where: {
			participant: {
				some: {
					profile: {
						id: session.profileId,
						userId: session.userId,
					},
					isNotAllowed: true,
				},
			},
		},
	})

	const friends = await prisma.profile.findMany({
		omit: {
			userId: true,
		},
		where: {
			friendProfile: {
				some: {
					byProfile: {
						id: session.profileId,
						userId: session.userId,
					},
				},
			},
		},
	})

	const rawReceivedFriendRequests = await prisma.friendRequest.findMany({
		where: {
			byProfile: {
				id: session.profileId,
				userId: session.userId,
			},
		},
		include: {
			requestProfile: {
				omit: {
					userId: true,
				},
			},
		},
	})

	const rawSentFriendRequests = await prisma.friendRequest.findMany({
		where: {
			requestProfile: {
				id: session.profileId,
				userId: session.userId,
			},
		},
		include: {
			byProfile: {
				omit: {
					userId: true,
				},
			},
		},
	})

	const receivedFriendRequests = rawReceivedFriendRequests.map(
		(friendRequest) => ({
			id: friendRequest.id,
			sentAt: friendRequest.sentAt,
			profileId: friendRequest.requestProfileId,
			profile: friendRequest.requestProfile,
		})
	)

	const sentFriendRequests = rawSentFriendRequests.map((friendRequest) => ({
		id: friendRequest.id,
		sentAt: friendRequest.sentAt,
		profileId: friendRequest.requestProfileId,
		profile: friendRequest.byProfile,
	}))

	const initData = {
		session: session,
		profile: profile,
		rooms: rooms,
		dmSessions: {
			allowedDmSessions: allowedDmSessions,
			notAllowedDmSessions: notAllowedDmSessions,
		},
		friends: friends,
		friendRequests: {
			receivedFriendRequests: receivedFriendRequests,
			sentFriendRequests: sentFriendRequests,
		},
	}

	return (
		<SocketProvider>
			<MainLayout initData={initData}>{children}</MainLayout>
		</SocketProvider>
	)
}

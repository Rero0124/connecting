import { getChannelByRoomIdAndId } from '@/src/lib/cacheUtil'
import prisma from '@/src/lib/prisma'
import { toBigInt } from '@/src/lib/util'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

type LayoutProps = {
	params: Promise<{ roomId: string; channelId: string }>
	children: React.ReactNode
}

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata> {
	const { roomId, channelId } = await params
	const channel = await getChannelByRoomIdAndId(
		roomId,
		toBigInt(channelId) ?? undefined
	)

	return {
		title: channel?.name ?? '채팅방',
	}
}

export default async function Layout({
	children,
	params,
}: Readonly<LayoutProps>) {
	const { roomId, channelId } = await params
	const channelIdBigInt = toBigInt(channelId)

	if (!channelIdBigInt) {
		redirect(`/room/${roomId}`)
	}

	const channel = await getChannelByRoomIdAndId(roomId, channelIdBigInt)

	if (!channel) {
		const firstChannel = await prisma.roomChannel.findFirst({
			where: {
				id: channelIdBigInt,
				roomId,
			},
		})

		if (firstChannel) {
			redirect(`/room/${roomId}/${firstChannel.id}`)
		} else {
			redirect(`/room/${roomId}`)
		}
	}

	return <>{children}</>
}

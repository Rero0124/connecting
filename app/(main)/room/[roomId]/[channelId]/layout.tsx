import { RoomChannel } from '@/src/components/room/RoomChannel'
import { getChannelByRoomIdAndId } from '@/src/lib/cacheUtil'
import prisma from '@/src/lib/prisma'
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
	const channelIdNumber = isNaN(Number(channelId)) ? -1 : Number(channelId)
	const channel = await getChannelByRoomIdAndId(roomId, channelIdNumber)

	return {
		title: channel?.name ?? '채팅방',
	}
}

export default async function Layout({
	children,
	params,
}: Readonly<LayoutProps>) {
	const { roomId, channelId } = await params
	const channelIdNumber = isNaN(Number(channelId)) ? -1 : Number(channelId)
	const channel = await getChannelByRoomIdAndId(roomId, channelIdNumber)

	if (!channel) {
		const firstChannel = await prisma.roomChannel.findFirst({
			where: {
				id: channelIdNumber,
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

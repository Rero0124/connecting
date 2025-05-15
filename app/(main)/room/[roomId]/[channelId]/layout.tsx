import prisma from '@/src/lib/prisma'
import { Metadata } from 'next'

type LayoutProps = {
	params: Promise<{ roomId: string; channelId: string }>
	children: React.ReactNode
}

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata> {
	const { roomId, channelId } = await params
	const channelIdNumber = isNaN(Number(channelId)) ? -1 : Number(channelId)
	const channel = await prisma.roomChannel.findUnique({
		where: { id: channelIdNumber, roomId },
		select: { name: true },
	})

	return {
		title: channel?.name ?? '채팅방',
	}
}

export default function Layout({ children }: Readonly<LayoutProps>) {
	return <>{children}</>
}

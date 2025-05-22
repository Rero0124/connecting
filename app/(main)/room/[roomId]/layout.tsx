import { getRoomById } from '@/src/lib/cacheUtil'
import prisma from '@/src/lib/prisma'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

type LayoutProps = {
	params: Promise<{ roomId: string }>
	children: React.ReactNode
}

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata> {
	const { roomId } = await params
	const room = await prisma.room.findUnique({
		where: { id: roomId },
		select: { name: true },
	})

	return {
		title: {
			default: room?.name ?? '채팅방',
			template: `%s | ${room?.name ?? '채팅방'}`,
		},
	}
}

export default async function Layout({
	children,
	params,
}: Readonly<LayoutProps>) {
	const { roomId } = await params
	const room = await getRoomById(roomId)

	if (!room) redirect(`/room`)

	return (
		<>
			<div className="flex grow">{children}</div>
			<div className="flex flex-col w-72 border-l-[1px]">
				<div className="block h-12 px-2.5 py-0.5 leading-12">
					중요 알림 (친한친구 채팅 및 약속)
				</div>
			</div>
		</>
	)
}

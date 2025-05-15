import prisma from '@/src/lib/prisma'
import { Metadata } from 'next'

type LayoutProps = {
	nav: React.ReactNode
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

export default function Layout({ children, nav }: Readonly<LayoutProps>) {
	return (
		<>
			{nav}
			<div className="grow">{children}</div>
			<div className="flex flex-col w-72 border-l-[1px]">
				<div className="block h-12 px-2.5 py-0.5 leading-12">
					중요 알림 (친한친구 채팅 및 약속)
				</div>
			</div>
		</>
	)
}

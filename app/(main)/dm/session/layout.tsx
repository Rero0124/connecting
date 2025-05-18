import { getFirstDmSession } from '@/src/lib/cacheUtil'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
	const dmSession = await getFirstDmSession()

	return {
		title: dmSession?.name ?? '채팅방',
	}
}

export default async function DmSessionLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <>{children}</>
}

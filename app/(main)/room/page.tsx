import prisma from '@/src/lib/prisma'
import { verifySession } from '@/src/lib/session'
import { redirect } from 'next/navigation'

export default async function Page() {
	const session = await verifySession(false)

	if (!session.isAuth) redirect('/login')

	const room = await prisma.room.findFirst({
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
		select: {
			id: true,
			name: true,
		},
	})

	room ? redirect(`/room/${room.id}`) : redirect('/dm')
}

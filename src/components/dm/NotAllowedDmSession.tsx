'use client'

import Link from 'next/link'
import { useAppSelector } from '@/src/lib/hooks'

export const NotAllowedDmSession = () => {
	const { notAllowedDmSessions } = useAppSelector((state) => state.dm)

	return (
		<div className="flex flex-col">
			{notAllowedDmSessions.map((notAllowedDmSession) => {
				return (
					<Link
						key={`key_allowed_message_` + notAllowedDmSession.id}
						href={`/dm/${notAllowedDmSession.id}`}
						className="block"
					>
						<p>{notAllowedDmSession.name}</p>
					</Link>
				)
			})}
		</div>
	)
}

export default NotAllowedDmSession

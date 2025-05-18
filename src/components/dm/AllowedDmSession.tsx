'use client'

import Link from 'next/link'
import { useAppSelector } from '@/src/lib/hooks'

export const AllowedDmSession = () => {
	const { allowedDmSessions } = useAppSelector((state) => state.dm)

	return (
		<div className="flex flex-col">
			{allowedDmSessions.map((allowedDmSession) => {
				return (
					<Link
						key={`key_allowed_message_` + allowedDmSession.id}
						href={`/dm/${allowedDmSession.id}`}
						className="block"
					>
						<p>{allowedDmSession.name}</p>
					</Link>
				)
			})}
		</div>
	)
}

export default AllowedDmSession

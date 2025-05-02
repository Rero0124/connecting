'use client'

import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'

export default function Main() {
	const dmData = useAppSelector((state) => state.dmData)
	const dispatch = useAppDispatch()

	return (
		<div className="">
			<main className="">
				<div className="flex flex-col">
					{dmData.allowedDmSessions.map((allowedDmSession) => {
						return (
							<Link
								key={`key_allowed_message_` + allowedDmSession.id}
								href={`/message/${allowedDmSession.id}`}
								className="block"
							>
								<p>{allowedDmSession.name}</p>
							</Link>
						)
					})}
				</div>
			</main>
		</div>
	)
}

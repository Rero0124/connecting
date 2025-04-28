'use client'

import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'

export default function Main() {
	const messageData = useAppSelector((state) => state.messageData)
	const dispatch = useAppDispatch()

	return (
		<div className="">
			<main className="">
				<div className="flex flex-col">
					{messageData.allowedMessages.map((allowedMessage) => {
						return (
							<Link
								key={`key_allowed_message_` + allowedMessage.id}
								href={`/message/${allowedMessage.id}`}
								className="block"
							>
								<p>{allowedMessage.name}</p>
							</Link>
						)
					})}
				</div>
			</main>
		</div>
	)
}

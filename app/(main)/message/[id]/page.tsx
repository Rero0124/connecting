'use client'

import { setDmDetail } from '@/src/lib/features/dmData/dmDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { socket } from '@/src/lib/socket'
import {
	DmSessionDetail,
	ErrorResponse,
	SuccessResponse,
} from '@/src/types/api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Main() {
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const dmData = useAppSelector((state) => state.dmData)
	const dispatch = useAppDispatch()

	const { id } = useParams<{ id: string }>()

	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault()
		socket.emit('send_dmMessage', id, pendingMessage)
		setPendingMessage('')
	}

	useEffect(() => {
		if (!dmData.dmDetails[id]) {
			fetch(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions/${id}`, {
				cache: 'no-store',
			})
				.then((res) => res.json())
				.then((data: SuccessResponse<DmSessionDetail> | ErrorResponse) => {
					if (data.status === 'success') {
						dispatch(setDmDetail(data.data))
					}
				})
		}
	}, [dmData])

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="">title</div>
			<div className="flex flex-col">
				{dmData.dmDetails[id] &&
					dmData.dmDetails[id].message.map((message) => (
						<div key={message.id}>{message.content}</div>
					))}
			</div>
			<div className="p-3">
				<form className="flex" onSubmit={submitMessage}>
					<input
						className="grow p-2 border rounded-md"
						value={pendingMessage}
						onChange={(e) => {
							setPendingMessage(e.currentTarget.value)
						}}
					/>
					<button className="w-16 p-2 ml-2 border rounded-md">보내기</button>
				</form>
			</div>
		</div>
	)
}

'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useParams } from 'next/navigation'
import { setRoomDetail } from '@/src/lib/features/roomData/roomDataSlice'
import { fetchWithValidation, serializeDatesForRedux } from '@/src/lib/util'
import {
	CreateRoomMessageBodySchema,
	GetRoomResponseSchema,
} from '@/src/lib/schemas/room.schema'

export default function Main() {
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const roomData = useAppSelector((state) => state.roomDate)
	const dispatch = useAppDispatch()

	const { id } = useParams<{ id: string }>()

	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault()
		fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			bodySchema: CreateRoomMessageBodySchema,
			body: { message: pendingMessage },
		})
		setPendingMessage('')
	}

	useEffect(() => {
		if (!roomData.roomDetails[id]) {
			fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`, {
				cache: 'no-store',
				dataSchema: GetRoomResponseSchema,
			}).then((data) => {
				if (data.status === 'success') {
					dispatch(setRoomDetail(serializeDatesForRedux(data.data)))
				}
			})
		}
	}, [roomData])

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="">title</div>
			<div className="flex flex-col">
				{roomData.roomDetails[id] &&
					roomData.roomDetails[id].message.map((message) => (
						<div key={`DmMessage_${message.roomId}_${message.id}`}>
							{message.content}
						</div>
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

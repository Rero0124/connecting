'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import {
	getRoomTextChannel,
	setRoomDetail,
} from '@/src/lib/features/room/roomSlice'
import { fetchWithValidation, serializeData } from '@/src/lib/util'
import {
	CreateRoomMessageBodySchema,
	GetRoomResponseSchema,
} from '@/src/lib/schemas/room.schema'
import { z } from 'zod'
import {
	ApiResponseSchema,
	SuccessResponseSchema,
} from '@/src/lib/schemas/api.schema'

export const RoomChannel = ({
	roomId,
	channelId,
}: {
	roomId: string
	channelId: bigint | null
}) => {
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const roomState = useAppSelector((state) => state.room)
	const dispatch = useAppDispatch()

	const channel = getRoomTextChannel(roomState, roomId, channelId ?? undefined)

	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault()
		fetchWithValidation(`/api/rooms/${roomId}/channels/${channelId}/messages`, {
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
		if (
			roomState.roomDetailIdx[roomId]?.channel[channelId?.toString() ?? '']
				?.idx === undefined
		) {
			fetchWithValidation(`/api/rooms/${roomId}`, {
				cache: 'no-store',
				dataSchema: GetRoomResponseSchema,
			}).then(async (data) => {
				if (data.status === 'success') {
					dispatch(setRoomDetail(serializeData(data.data)))
				}
			})
		}
	}, [roomState])

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="">title</div>
			<div className="flex flex-col">
				{channel &&
					channel.message.map((message) => (
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

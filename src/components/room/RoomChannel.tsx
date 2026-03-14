'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useContextMenu, type ContextMenuEntry } from '@/src/provider/ContextMenuProvider'
import {
	getRoomTextChannel,
	setRoomDetail,
} from '@/src/lib/features/room/roomSlice'
import { fetchWithValidation, serializeData } from '@/src/lib/util'
import {
	CreateRoomMessageBodySchema,
	GetRoomResponseSchema,
} from '@/src/lib/schemas/room.schema'

export const RoomChannel = ({
	roomId,
	channelId,
}: {
	roomId: string
	channelId: bigint | null
}) => {
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const roomState = useAppSelector((state) => state.room)
	const viewContextState = useAppSelector((state) => state.viewContext)
	const dispatch = useAppDispatch()
	const contextMenu = useContextMenu()
	let pastMessageProfileId: string = ''

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

	const getMessageMenuItems = (
		messageContent: string,
		messageId: bigint | number | string,
		isMe: boolean
	): ContextMenuEntry[] => [
		{
			label: '메시지 복사',
			onClick: () => navigator.clipboard.writeText(messageContent),
		},
		...(isMe
			? [
					{ separator: true } as const,
					{
						label: '메시지 삭제',
						danger: true,
						onClick: () => {
							if (confirm('이 메시지를 삭제하시겠습니까?')) {
								fetch(
									`/api/rooms/${roomId}/channels/${channelId}/messages/${messageId}`,
									{ method: 'DELETE' }
								)
							}
						},
					},
				]
			: []),
	]

	return (
		<div className="flex flex-col justify-between h-full bg-background">
			{/* Channel Header */}
			<div className="flex items-center h-12 px-4 border-b border-border bg-background-secondary/50 shrink-0">
				<svg
					className="w-4 h-4 mr-2 text-foreground-dim"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.8}
				>
					<path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
				</svg>
				<span className="text-sm font-semibold text-foreground">
					{channel?.name ?? '채널'}
				</span>
			</div>

			{/* Messages */}
			<div className="flex flex-col grow overflow-y-auto h-0 px-4 py-3 gap-0.5">
				{channel &&
					channel.message.map((message) => {
						const isMe = message.profileId === viewContextState.profile?.id
						const pastMessageSameUser = message.profileId === pastMessageProfileId
						pastMessageProfileId = message.profileId
						const menuItems = getMessageMenuItems(message.content, message.id, isMe)

						return isMe ? (
							<div
								key={`RoomMessage_${message.roomId}_${message.id}`}
								className="flex justify-end animate-slide-in"
								onContextMenu={(e) => contextMenu.open(e, menuItems)}
							>
								<div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-br-md bg-accent text-white text-sm">
									{message.content}
								</div>
							</div>
						) : (
							<div
								key={`RoomMessage_${message.roomId}_${message.id}`}
								className="flex items-start gap-2.5 animate-slide-in"
								onContextMenu={(e) => contextMenu.open(e, menuItems)}
							>
								{!pastMessageSameUser ? (
									<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0 mt-0.5">
										{(message.profile.name ?? message.profile.tag).charAt(0).toUpperCase()}
									</div>
								) : (
									<div className="w-8 shrink-0" />
								)}
								<div className="flex flex-col max-w-[70%]">
									{!pastMessageSameUser && (
										<div className="flex items-baseline gap-2 mb-0.5">
											<span className="text-sm font-semibold text-foreground">
												{message.profile.name ?? message.profile.tag}
											</span>
											<span className="text-[11px] text-foreground-dim">
												{new Date(message.sentAt).toLocaleString()}
											</span>
										</div>
									)}
									<div className="px-3.5 py-2 rounded-2xl rounded-bl-md bg-background-light text-sm text-foreground">
										{message.content}
									</div>
								</div>
							</div>
						)
					})}
				{(!channel || channel.message.length === 0) && (
					<div className="flex flex-col items-center justify-center flex-1 text-foreground-dim">
						<svg
							className="w-12 h-12 mb-3 opacity-30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1}
						>
							<path d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
						</svg>
						<p className="text-sm">아직 메시지가 없습니다</p>
						<p className="text-xs mt-1">첫 번째 메시지를 보내보세요!</p>
					</div>
				)}
			</div>

			{/* Message Input */}
			<div className="px-4 pb-4 pt-2 shrink-0">
				<form
					className="flex items-center gap-2 bg-background-light border border-border rounded-xl px-3"
					onSubmit={submitMessage}
				>
					<input
						className="flex-1 h-11 bg-transparent text-sm text-foreground placeholder:text-foreground-dim outline-none"
						placeholder="메시지를 입력하세요..."
						value={pendingMessage}
						onChange={(e) => {
							setPendingMessage(e.currentTarget.value)
						}}
					/>
					<button
						type="submit"
						className="w-8 h-8 flex items-center justify-center rounded-lg text-accent hover:bg-accent/10 transition-colors disabled:opacity-30"
						disabled={!pendingMessage.trim()}
					>
						<svg
							className="w-[18px] h-[18px]"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
						</svg>
					</button>
				</form>
			</div>
		</div>
	)
}

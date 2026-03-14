'use client'

import { setDmDetail } from '@/src/lib/features/dm/dmSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useVoiceCall } from '@/src/lib/hooks/useVoiceCall'
import {
	CreateDmMessageBodySchema,
	GetDmSessionResponseSchema,
} from '@/src/lib/schemas/dm.schema'
import {
	deserializeData,
	fetchWithValidation,
	serializeData,
	toBigInt,
} from '@/src/lib/util'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useContextMenu, type ContextMenuEntry } from '@/src/provider/ContextMenuProvider'

export const DmSessionRoom = () => {
	const dmState = useAppSelector((state) => state.dm)
	const viewContextState = useAppSelector((state) => state.viewContext)
	const dispatch = useAppDispatch()
	const {
		startCalling,
		stopCalling,
		toggleMic,
		isMicOn,
		toggleCamera,
		isCameraOn,
		toggleScreen,
		isScreenOn,
	} = useVoiceCall()
	const contextMenu = useContextMenu()
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const [isCalling, setIsCalling] = useState(false)
	let pastMessageProfileId = -1n

	const { dmSessionId } = useParams<{ dmSessionId: string }>()

	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault()
		fetchWithValidation(`/api/dm-sessions/${dmSessionId}/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			bodySchema: CreateDmMessageBodySchema,
			body: { message: pendingMessage },
		})
		setPendingMessage('')
	}

	const handleCallingStart = () => {
		setIsCalling(true)
		startCalling(dmSessionId)
	}

	const handleCallingStop = () => {
		setIsCalling(false)
		stopCalling()
	}

	const handleCallingMute = () => {
		toggleMic()
	}

	const handleCamera = () => {
		toggleCamera()
	}

	const handleScreenShare = () => {
		toggleScreen()
	}

	useEffect(() => {
		if (!dmState.dmDetails[dmSessionId]) {
			fetchWithValidation(`/api/dm-sessions/${dmSessionId}`, {
				cache: 'no-store',
				dataSchema: GetDmSessionResponseSchema,
			}).then((data) => {
				if (data.status === 'success') {
					dispatch(setDmDetail(serializeData(data.data)))
				}
			})
		}
	}, [dmState])

	const getDmMessageMenuItems = (
		content: string,
		messageId: bigint | number | string,
		isMe: boolean
	): ContextMenuEntry[] => [
		{
			label: '메시지 복사',
			onClick: () => navigator.clipboard.writeText(content),
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
									`/api/dm-sessions/${dmSessionId}/messages/${messageId}`,
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
			{/* Chat Header */}
			<div className="flex justify-between items-center h-12 px-4 border-b border-border bg-background-secondary/50 shrink-0">
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
						{(dmState.dmDetails[dmSessionId]?.name ?? '?')
							.charAt(0)
							.toUpperCase()}
					</div>
					<span className="text-sm font-semibold text-foreground">
						{dmState.dmDetails[dmSessionId]?.name ?? ''}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={handleCallingStart}
						className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
						title="음성 통화"
					>
						<svg
							className="w-[18px] h-[18px]"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
						</svg>
					</button>
				</div>
			</div>

			{/* Call Bar */}
			{isCalling && (
				<div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border-b border-success/20 shrink-0">
					<div className="w-2 h-2 rounded-full bg-success animate-pulse" />
					<span className="text-xs font-medium text-success mr-auto">
						통화 중
					</span>
					<button
						className="h-7 px-3 text-xs font-medium rounded-lg bg-background-light text-foreground-muted hover:text-foreground border border-border transition-colors"
						onClick={handleCallingMute}
					>
						{isMicOn ? '음소거' : '음소거 해제'}
					</button>
					<button
						className="h-7 px-3 text-xs font-medium rounded-lg bg-background-light text-foreground-muted hover:text-foreground border border-border transition-colors"
						onClick={handleCamera}
					>
						{isCameraOn ? '카메라 끄기' : '카메라 켜기'}
					</button>
					<button
						className="h-7 px-3 text-xs font-medium rounded-lg bg-background-light text-foreground-muted hover:text-foreground border border-border transition-colors"
						onClick={handleScreenShare}
					>
						{isScreenOn ? '공유 중지' : '화면 공유'}
					</button>
					<button
						className="h-7 px-3 text-xs font-medium rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
						onClick={handleCallingStop}
					>
						통화 종료
					</button>
				</div>
			)}
			{isCalling && <div id="videoContainer" />}

			{/* Messages */}
			<div className="flex flex-col grow overflow-y-auto h-0 px-4 py-3 gap-0.5">
				{dmState.dmDetails[dmSessionId] &&
					dmState.dmDetails[dmSessionId].message.map((message, idx) => {
						const msg = deserializeData(message)
						const pastMessageSameUser = msg.profileId === pastMessageProfileId
						pastMessageProfileId = msg.profileId
						const isMe = message.profileId === viewContextState.profile?.id
						const menuItems = getDmMessageMenuItems(message.content, message.id, isMe)

						return isMe ? (
							<div
								key={`DmMessage_${message.dmSessionId}_${message.id}`}
								className="flex justify-end animate-slide-in"
								onContextMenu={(e) => contextMenu.open(e, menuItems)}
							>
								<div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-br-md bg-accent text-white text-sm">
									{message.content}
								</div>
							</div>
						) : (
							<div
								key={`DmMessage_${message.dmSessionId}_${message.id}`}
								className="flex items-start gap-2.5 animate-slide-in"
								onContextMenu={(e) => contextMenu.open(e, menuItems)}
							>
								{!pastMessageSameUser ? (
									<Image
										alt="프로필"
										src={message.profile.image}
										width={36}
										height={36}
										className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
									/>
								) : (
									<div className="w-9 shrink-0" />
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

export default DmSessionRoom

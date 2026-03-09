'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/src/components/ui/DragAbleDiv'
import { getRoomTextChannel } from '@/src/lib/features/room/roomSlice'
import { setNavSize } from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { RoomChannel } from '@/src/lib/schemas/room.schema'
import { deserializeData, toBigInt } from '@/src/lib/util'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export const RoomNav = ({
	roomId,
	channelId,
}: {
	roomId: string
	channelId?: bigint | null
}) => {
	const { navSize, title } = useAppSelector((state) => state.viewContext)
	const roomState = useAppSelector((state) => state.room)
	const dispatch = useAppDispatch()
	const navRef = useRef<HTMLDivElement>(null)

	const [selectedChannelId, setSelectedChannelId] = useState(channelId ?? -1n)

	const room = roomState.roomDetails[roomState.roomDetailIdx[roomId]?.idx]

	const onDragEnd = ({ x }: { x: number }) => {
		dispatch(setNavSize(x))
	}

	const onDragging = ({ x }: { x: number }) => {
		if (navRef.current) {
			navRef.current.style.width = `${x}px`
		}
	}

	const dragAbleDivOption: DragAbleDivOption = {
		direction: 'right',
		hoverSize: 8,
		onDraggingInterval: 0,
		minWidth: 180,
		maxWidth: 300,
		hoverColor: 'background-light',
	}

	function Channel({
		children,
		name,
		classname = '',
		channelId,
	}: {
		children?: React.ReactNode
		name: string
		classname?: string
		channelId?: bigint | null
	}) {
		const onClick = () => {
			setSelectedChannelId(
				toBigInt(
					getRoomTextChannel(roomState, roomId, channelId ?? undefined)?.id
				) ?? -2n
			)
		}

		return (
			<Link
				href={`/room/${roomId}/${channelId}`}
				className={`${classname} block h-8 px-2.5 py-0.5 leading-12 mb-1 rounded`}
				onClick={onClick}
			>
				{children}
			</Link>
		)
	}
	return (
		<DragAbleDiv
			classname="bg-background-secondary border-r border-border"
			option={dragAbleDivOption}
			onDragging={onDragging}
			onDragEnd={onDragEnd}
		>
			<div
				ref={navRef}
				className="bg-background-secondary flex flex-col h-full px-2 py-3"
				style={{ width: navSize }}
			>
				{/* 채널 헤더 */}
				<div className="flex items-center justify-between px-3 h-8 mb-1">
					<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
						채널
					</span>
					<button
						className="w-5 h-5 flex items-center justify-center rounded text-foreground-dim hover:text-foreground hover:bg-background-light transition-colors"
						title="채널 추가"
					>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.5}
						>
							<path d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>
				</div>

				{/* 채널 목록 */}
				<div className="flex flex-col gap-0.5">
					{room &&
						room.channel.map((serializedChannel) => {
							const channel = deserializeData(serializedChannel)
							return (
								<Channel
									key={`${channel.id}`}
									channelId={toBigInt(channel.id)}
									name="send"
									classname={
										(toBigInt(channel.id) === selectedChannelId
											? 'bg-background-light text-foreground'
											: 'text-foreground-muted hover:bg-background-light hover:text-foreground') +
										' flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition-colors'
									}
								>
									<svg
										className="w-4 h-4 shrink-0 text-foreground-dim"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.8}
									>
										<path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
									</svg>
									<span className="truncate">{channel.name}</span>
								</Channel>
							)
						})}
				</div>
			</div>
		</DragAbleDiv>
	)
}

export default RoomNav

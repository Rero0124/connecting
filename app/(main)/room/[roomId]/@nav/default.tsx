'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/app/_components/DragAbleDiv'
import { getRoomTextChannel } from '@/src/lib/features/room/roomSlice'
import { setNavSize } from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useParams } from 'next/navigation'
import { useRef, useState } from 'react'

export default function Default() {
	const { navSize, title } = useAppSelector((state) => state.viewContext)
	const roomState = useAppSelector((state) => state.room)
	const dispatch = useAppDispatch()
	const navRef = useRef<HTMLDivElement>(null)
	const { roomId, channelId } = useParams<{
		roomId: string
		channelId?: string
	}>()
	const channelIdNum = isNaN(Number(channelId))
		? roomState.roomDetails[roomId]
		: Number(channelId)

	const [selectedChannelId, setSelectedChannelId] = useState(-1)

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
		channelId?: number
	}) {
		const onClick = () => {
			setSelectedChannelId(
				getRoomTextChannel(roomState, roomId, channelId)?.id ?? -2
			)
		}

		return (
			<div
				className={`${classname} block h-8 px-2.5 py-0.5 leading-12 mb-1 rounded`}
				onClick={onClick}
			>
				{children}
			</div>
		)
	}
	return (
		<DragAbleDiv
			classname="bg-background border-r-[1px]"
			option={dragAbleDivOption}
			onDragging={onDragging}
			onDragEnd={onDragEnd}
		>
			<div
				ref={navRef}
				className="bg-background flex flex-col h-full pl-2.5 pr-1 py-2"
				style={{ width: navSize }}
			>
				<div className="flex flex-row px-2.5 py-0.5 mb-1 justify-between h-10 leading-12">
					<span>채널 추가</span>
					<div className="flex flex-row justify-between w-8">
						<span className="cursor-pointer">+</span>
					</div>
				</div>
				{roomState.roomDetails[roomId] &&
					Object.values(roomState.roomDetails[roomId].channel).map(
						(channel) => (
							<Channel key={`${channel.id}`} channelId={channel.id} name="send">
								{channel.name}
							</Channel>
						)
					)}
			</div>
		</DragAbleDiv>
	)
}

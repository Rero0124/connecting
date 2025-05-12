'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/app/_components/DragAbleDiv'
import {
	setNavSize,
	setSelectedMessageMenu,
	setTitle,
} from '@/src/lib/features/saveData/saveDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchWithValidation, serializeDatesForRedux } from '@/src/lib/util'
import { GetRoomResponseSchema } from '@/src/lib/schemas/room.schema'
import { setRoomDetail } from '@/src/lib/features/roomData/roomDataSlice'

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const { navSize, title, selectedMessageMenu } = useAppSelector(
		(state) => state.saveData
	)
	const roomData = useAppSelector((state) => state.roomDate)
	const dispatch = useAppDispatch()
	const navRef = useRef<HTMLDivElement>(null)
	const { id } = useParams<{ id: string }>()

	const onDragEnd = ({ x }: { x: number }) => {
		dispatch(setNavSize(x))
	}

	const onDragging = ({ x }: { x: number }) => {
		if (navRef.current) {
			navRef.current.style.width = `${x}px`
		}
	}

	useEffect(() => {
		if (!roomData.roomDetails[id]) {
			fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}`, {
				cache: 'no-store',
				dataSchema: GetRoomResponseSchema,
			}).then((data) => {
				if (data.status === 'success') {
					dispatch(setRoomDetail(serializeDatesForRedux(data.data)))
				}
			})
		} else {
			dispatch(setTitle(roomData.roomDetails[id]?.name))
		}
	}, [id])

	useEffect(() => {
		document.title = title
	}, [title])

	const dragAbleDivOption: DragAbleDivOption = {
		direction: 'right',
		hoverSize: 8,
		onDraggingInterval: 0,
		minWidth: 180,
		maxWidth: 300,
		hoverColor: 'background-light',
	}

	function Menu({
		children,
		name,
		classname = '',
		href = '',
	}: {
		children?: React.ReactNode
		name: string
		classname?: string
		href?: string
	}) {
		const onClick = () => {}

		return href === '' ? (
			<div
				className={`${classname} block h-8 px-2.5 py-0.5 leading-12 mb-1 rounded`}
				onClick={onClick}
			>
				{children}
			</div>
		) : (
			<Link
				href={href}
				className={`${classname} block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded`}
				onClick={onClick}
			>
				{children}
			</Link>
		)
	}

	return (
		<>
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
						<span>메세지</span>
						<div className="flex flex-row justify-between w-8">
							<span className="cursor-pointer">+</span>
							<span>∇</span>
						</div>
					</div>
					{roomData.roomDetails[id] &&
						roomData.roomDetails[id].channel.map((channel) => (
							<Menu
								key={`${channel.id}`}
								href={`/room/${channel.id}`}
								name="send"
							>
								{channel.name}
							</Menu>
						))}
				</div>
			</DragAbleDiv>
			<div className="grow">{children}</div>
			<div className="flex flex-col w-72 border-l-[1px]">
				<div className="block h-12 px-2.5 py-0.5 leading-12">
					중요 알림 (친한친구 채팅 및 약속)
				</div>
			</div>
		</>
	)
}

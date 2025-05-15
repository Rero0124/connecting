'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/src/components/ui/DragAbleDiv'
import {
	setNavSize,
	setSelectedFriendMenu,
} from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function NavDefault() {
	const { navSize, selectedFriendMenu } = useAppSelector(
		(state) => state.viewContext
	)
	const dispatch = useAppDispatch()

	const navRef = useRef<HTMLDivElement>(null)

	const onDragEnd = ({ x }: { x: number }) => {
		dispatch(setNavSize(x))
	}

	const onDragging = ({ x }: { x: number }) => {
		if (navRef.current) {
			navRef.current.style.width = `${x}px`
		}
	}

	useEffect(() => {
		if (!selectedFriendMenu) {
			dispatch(setSelectedFriendMenu('list'))
		}
	}, [])

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
	}: {
		children: React.ReactNode
		name: string
		classname?: string
	}) {
		const onClick = () => {
			dispatch(setSelectedFriendMenu(name))
		}

		return (
			<Link
				href={`/friend/${name}`}
				className={`block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded ${classname}`}
				onClick={onClick}
			>
				{children}
			</Link>
		)
	}
	return (
		<DragAbleDiv
			classname="bg-background"
			option={dragAbleDivOption}
			onDragging={onDragging}
			onDragEnd={onDragEnd}
		>
			<div
				ref={navRef}
				className="bg-background flex flex-col h-full pl-2.5 pr-1 py-2"
				style={{ width: navSize }}
			>
				<Menu
					name="list"
					classname={
						selectedFriendMenu === 'list'
							? 'bg-background-light'
							: 'hover:bg-background-light'
					}
				>
					친구목록
				</Menu>
				<Menu
					name="request"
					classname={
						selectedFriendMenu === 'request'
							? 'bg-background-light'
							: 'hover:bg-background-light'
					}
				>
					친구추가
				</Menu>
				<Menu
					name="manage"
					classname={
						selectedFriendMenu === 'manage'
							? 'bg-background-light'
							: 'hover:bg-background-light'
					}
				>
					친구 관리
				</Menu>
			</div>
		</DragAbleDiv>
	)
}

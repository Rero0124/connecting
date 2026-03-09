'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/src/components/ui/DragAbleDiv'
import { setNavSize } from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { setContextMenu } from '@/src/provider/ContextMenuProvider'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export const FriendNav = () => {
	const { navSize, selectedFriendMenu } = useAppSelector(
		(state) => state.viewContext
	)
	const dispatch = useAppDispatch()

	const navRef = useRef<HTMLDivElement>(null)
	const contextRef = useRef<HTMLDivElement>(null)

	const onDragEnd = ({ x }: { x: number }) => {
		dispatch(setNavSize(x))
	}

	const onDragging = ({ x }: { x: number }) => {
		if (navRef.current) {
			navRef.current.style.width = `${x}px`
		}
	}

	useEffect(() => {
		if (contextRef.current) {
			setContextMenu(contextRef.current, [
				{
					name: '친구목록',
					callback: () => {
						redirect('/friend/list')
					},
				},
				{
					name: '친구추가',
					callback: () => {
						redirect('/friend/request')
					},
				},
				{
					name: '친구 관리',
					callback: () => {
						redirect('/friend/manage')
					},
				},
			])
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
		return (
			<Link
				href={`/friend/${name}`}
				className={`block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded ${classname}`}
			>
				{children}
			</Link>
		)
	}
	return (
		<DragAbleDiv
			ref={contextRef}
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
				{/* 섹션 헤더 */}
				<div className="px-3 h-8 flex items-center mb-1">
					<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
						친구
					</span>
				</div>

				<div className="flex flex-col gap-0.5">
					<Menu
						name="list"
						classname={
							(selectedFriendMenu === 'list'
								? 'bg-background-light text-foreground'
								: 'text-foreground-muted hover:bg-background-light hover:text-foreground') +
							' flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm transition-colors'
						}
					>
						<svg
							className="w-4 h-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
						</svg>
						<span>친구 목록</span>
					</Menu>
					<Menu
						name="request"
						classname={
							(selectedFriendMenu === 'request'
								? 'bg-background-light text-foreground'
								: 'text-foreground-muted hover:bg-background-light hover:text-foreground') +
							' flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm transition-colors'
						}
					>
						<svg
							className="w-4 h-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
						</svg>
						<span>친구 요청</span>
					</Menu>
					<Menu
						name="manage"
						classname={
							(selectedFriendMenu === 'manage'
								? 'bg-background-light text-foreground'
								: 'text-foreground-muted hover:bg-background-light hover:text-foreground') +
							' flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm transition-colors'
						}
					>
						<svg
							className="w-4 h-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
							<path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
						<span>친구 관리</span>
					</Menu>
				</div>
			</div>
		</DragAbleDiv>
	)
}

export default FriendNav

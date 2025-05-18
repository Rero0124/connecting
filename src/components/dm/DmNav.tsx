'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/src/components/ui/DragAbleDiv'
import { setNavSize } from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { setContextMenu } from '@/src/provider/ContextMenuProvider'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import AddDmModal from '@/src/components/dm/AddDmModal'
import { redirect } from 'next/navigation'

export const DmNav = () => {
	const { navSize, selectedMessageMenu } = useAppSelector(
		(state) => state.viewContext
	)
	const dmState = useAppSelector((state) => state.dm)
	const dispatch = useAppDispatch()

	const [addMessageModalOpen, setAddMessageModalOpen] = useState<boolean>(false)
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

	const dragAbleDivOption: DragAbleDivOption = {
		direction: 'right',
		hoverSize: 8,
		onDraggingInterval: 0,
		minWidth: 180,
		maxWidth: 300,
		hoverColor: 'background-light',
	}

	useEffect(() => {
		if (contextRef.current) {
			setContextMenu(contextRef.current, [
				{
					name: '메세지 요청&스팸',
					callback: () => {
						redirect('/dm/notAllow')
					},
				},
				...dmState.allowedDmSessions.map((dmSession) => ({
					name: dmSession.name,
					callback: () => {
						redirect('/dm/session/' + dmSession.id)
					},
				})),
			])
		}
	}, [])

	function Menu({
		children,
		name,
		classname = '',
	}: {
		children?: React.ReactNode
		name: string
		classname?: string
	}) {
		return (
			<Link
				href={'/dm/' + name}
				className={`${classname} block h-12 px-2.5 py-0.5 leading-12 mb-1 rounded`}
			>
				{children}
			</Link>
		)
	}

	const openAddMessageModal = () => {
		setAddMessageModalOpen(true)
	}

	return (
		<>
			<DragAbleDiv
				ref={contextRef}
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
					<Menu
						name="notAllow"
						classname={
							(selectedMessageMenu === 'notAllow'
								? 'bg-background-light'
								: 'hover:bg-background-light') + ' min-h-12'
						}
					>
						메세지 요청 & 스팸
					</Menu>
					<hr className="mt-1" />
					<div className="flex flex-row px-2.5 py-0.5 mb-1 justify-between h-10 leading-12">
						<span>메세지</span>
						<div className="flex flex-row justify-between w-8">
							<span className="cursor-pointer" onClick={openAddMessageModal}>
								+
							</span>
							<span>∇</span>
						</div>
					</div>
					{dmState.allowedDmSessions.map((dmSession) => (
						<Menu
							key={`dm_session_${dmSession.id}_menu`}
							name={`session/${dmSession.id}`}
						>
							{dmSession.name}
						</Menu>
					))}
				</div>
			</DragAbleDiv>
			<AddDmModal
				isOpen={addMessageModalOpen}
				onClose={() => {
					setAddMessageModalOpen(false)
				}}
			/>
		</>
	)
}

export default DmNav

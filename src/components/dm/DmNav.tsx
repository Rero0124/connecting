'use client'

import DragAbleDiv, { DragAbleDivOption } from '@/src/components/ui/DragAbleDiv'
import { setNavSize } from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useContextMenu } from '@/src/provider/ContextMenuProvider'
import Link from 'next/link'
import { useRef, useState } from 'react'
import AddDmModal from '@/src/components/dm/AddDmModal'
import { useRouter } from 'next/navigation'

export const DmNav = () => {
	const { navSize, selectedMessageMenu } = useAppSelector(
		(state) => state.viewContext
	)
	const dmState = useAppSelector((state) => state.dm)
	const dispatch = useAppDispatch()
	const router = useRouter()
	const contextMenu = useContextMenu()

	const [addMessageModalOpen, setAddMessageModalOpen] = useState<boolean>(false)
	const navRef = useRef<HTMLDivElement>(null)

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
				className={classname}
			>
				{children}
			</Link>
		)
	}

	const openAddMessageModal = () => {
		setAddMessageModalOpen(true)
	}

	const handleDmContextMenu = (e: React.MouseEvent, dmSessionId: string, dmName: string) => {
		contextMenu.open(e, [
			{
				label: `${dmName} 열기`,
				onClick: () => router.push(`/dm/session/${dmSessionId}`),
			},
			{ separator: true },
			{
				label: 'DM 나가기',
				onClick: () => {
					if (confirm(`"${dmName}" DM을 나가시겠습니까?`)) {
						fetch(`/api/dm-sessions/${dmSessionId}`, { method: 'DELETE' })
					}
				},
				danger: true,
			},
		])
	}

	return (
		<>
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
					{/* 메시지 요청 */}
					<Menu
						name="notAllow"
						classname={
							(selectedMessageMenu === 'notAllow'
								? 'bg-background-light text-foreground'
								: 'text-foreground-muted hover:bg-background-light hover:text-foreground') +
							' min-h-10 flex items-center gap-2 px-3 rounded-lg text-sm transition-colors'
						}
					>
						<svg
							className="w-4 h-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
						</svg>
						<span>메시지 요청</span>
					</Menu>

					{/* 구분선 */}
					<div className="my-2 mx-2 h-px bg-border-light" />

					{/* 메시지 헤더 */}
					<div className="flex items-center justify-between px-3 h-8 mb-1">
						<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
							다이렉트 메시지
						</span>
						<button
							className="w-5 h-5 flex items-center justify-center rounded text-foreground-dim hover:text-foreground hover:bg-background-light transition-colors"
							onClick={openAddMessageModal}
							title="새 DM 만들기"
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

					{/* DM 목록 */}
					<div className="flex flex-col gap-0.5">
						{dmState.allowedDmSessions.length === 0 ? (
							<p className="px-3 py-4 text-xs text-foreground-dim text-center">
								아직 대화가 없습니다
							</p>
						) : (
							dmState.allowedDmSessions.map((dmSession) => (
								<div
									key={`dm_session_${dmSession.id}_menu`}
									onContextMenu={(e) =>
										handleDmContextMenu(e, String(dmSession.id), dmSession.name)
									}
								>
									<Menu
										name={`session/${dmSession.id}`}
										classname="flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm text-foreground-muted hover:bg-background-light hover:text-foreground transition-colors"
									>
										<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
											{dmSession.name.charAt(0).toUpperCase()}
										</div>
										<span className="truncate">{dmSession.name}</span>
									</Menu>
								</div>
							))
						)}
					</div>
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

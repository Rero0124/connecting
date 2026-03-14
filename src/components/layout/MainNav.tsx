'use client'

import { useAppSelector } from '@/src/lib/hooks'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ProfileEditModal from '@/src/components/profile/ProfileEditModal'
import CreateRoomModal from '@/src/components/room/CreateRoomModal'

const NavButton = ({
	href,
	children,
	className = '',
	onClick,
	tooltip,
	active,
}: {
	href?: string
	children: React.ReactNode
	className?: string
	onClick?: () => void
	tooltip?: string
	active?: boolean
}) => {
	const baseClass = `group relative flex items-center justify-center w-12 h-12 mx-auto my-1 rounded-2xl hover:rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium ${
		active
			? 'bg-accent text-white rounded-xl'
			: 'bg-background-light text-foreground-muted hover:bg-accent hover:text-white'
	} ${className}`

	const tooltipEl = tooltip ? (
		<span className="absolute left-full ml-3 px-3 py-1.5 bg-[#111827] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
			{tooltip}
		</span>
	) : null

	if (href) {
		return (
			<Link href={href} className={baseClass}>
				{children}
				{tooltipEl}
			</Link>
		)
	}
	return (
		<div onClick={onClick} className={baseClass}>
			{children}
			{tooltipEl}
		</div>
	)
}

const NavSepar = () => (
	<div className="flex justify-center my-1">
		<div className="w-8 h-[2px] rounded-full bg-border-light" />
	</div>
)

export const MainNav = () => {
	const roomState = useAppSelector((state) => state.room)
	const profile = useAppSelector((state) => state.viewContext.profile)
	const [showSettings, setShowSettings] = useState(false)
	const [showProfileModal, setShowProfileModal] = useState(false)
	const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
	const settingsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				settingsRef.current &&
				!settingsRef.current.contains(e.target as Node)
			) {
				setShowSettings(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<>
			<div className="flex flex-col h-full w-[72px] py-3 bg-background-secondary border-r border-border shrink-0">
				<div className="flex flex-col grow overflow-y-auto h-0 gap-0.5">
					<div className="relative inset-0 overflow-y-auto px-1.5">
						{/* 친구 */}
						<NavButton href="/friend" tooltip="친구">
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
							</svg>
						</NavButton>

						{/* DM */}
						<NavButton href="/dm" tooltip="다이렉트 메시지">
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
							</svg>
						</NavButton>

						<NavSepar />

						{/* 방 목록 */}
						{roomState.rooms.map((room) => (
							<NavButton
								key={`nav_room_link_${room.id}`}
								href={`/room/${room.id}`}
								tooltip={room.name}
							>
								<span className="text-xs font-bold leading-none">
									{room.name.charAt(0).toUpperCase()}
								</span>
							</NavButton>
						))}
						{roomState.rooms.length > 0 && <NavSepar />}

						{/* 방 생성 */}
						<NavButton
							onClick={() => setShowCreateRoomModal(true)}
							tooltip="방 만들기"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
						</NavButton>

						{/* 탐색 */}
						<NavButton tooltip="탐색">
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
							</svg>
						</NavButton>
					</div>
				</div>

				{/* 하단 영역 - 설정 + 프로필 */}
				<div className="flex flex-col items-center gap-0.5 px-1.5 pt-1 border-t border-border">
					<div className="relative w-full" ref={settingsRef}>
						<NavButton
							onClick={() => setShowSettings(!showSettings)}
							tooltip="설정"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
								<path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
							</svg>
						</NavButton>
						{showSettings && (
							<div className="absolute left-full ml-2 bottom-0 bg-background-secondary text-sm rounded-xl shadow-lg border border-border-light w-48 z-50 overflow-hidden">
								<button
									className="w-full text-left px-4 py-2.5 text-foreground-muted hover:bg-background-light hover:text-foreground transition-colors"
									onClick={() => {
										setShowProfileModal(true)
										setShowSettings(false)
									}}
								>
									프로필 편집
								</button>
								<Link
									href="/setting"
									className="block px-4 py-2.5 text-foreground-muted hover:bg-background-light hover:text-foreground transition-colors"
								>
									앱 설정
								</Link>
								<div className="border-t border-border" />
								<Link
									href="/logout"
									className="block px-4 py-2.5 text-danger hover:bg-danger/10 transition-colors"
								>
									로그아웃
								</Link>
							</div>
						)}
					</div>

					{/* 프로필 아바타 */}
					<NavButton
						onClick={() => {
							setShowProfileModal(true)
							setShowSettings(false)
						}}
						tooltip="내 프로필"
					>
						<span className="text-xs font-bold">
							{(profile?.name ?? profile?.tag ?? '?').charAt(0).toUpperCase()}
						</span>
					</NavButton>
				</div>
			</div>

			{profile && (
				<ProfileEditModal
					open={showProfileModal}
					onClose={() => setShowProfileModal(false)}
					initialData={{
						userTag: profile.tag,
						userName: profile.name ?? '',
						image: profile.image ?? '/default-profile.png',
					}}
				/>
			)}

			<CreateRoomModal
				isOpen={showCreateRoomModal}
				onClose={() => setShowCreateRoomModal(false)}
			/>
		</>
	)
}

export default MainNav

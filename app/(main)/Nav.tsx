'use client'

import { useAppSelector } from '@/lib/hooks'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ProfileEditModal from './ProfileEditModal' // 모달 임포트

const NavButton = ({
	href,
	children,
	className = '',
	onClick,
}: {
	href?: string
	children: React.ReactNode
	className?: string
	onClick?: () => void
}) => {
	if (href) {
		return (
			<Link
				href={href}
				className={`block w-12 h-12 mx-3 my-1.5 p-0.5 bg-background-room-icon rounded-lg ${className}`}
			>
				{children}
			</Link>
		)
	}
	return (
		<div
			onClick={onClick}
			className={`block w-12 h-12 mx-3 my-1.5 p-0.5 bg-background-room-icon rounded-lg cursor-pointer ${className}`}
		>
			{children}
		</div>
	)
}

const NavSepar = () => <hr className="w-10 mx-4 m-3" />

export default function Nav() {
	const roomDate = useAppSelector((state) => state.roomDate)
	const profile = useAppSelector((state) => state.saveData.profile)
	const [showSettings, setShowSettings] = useState(false)
	const [showProfileModal, setShowProfileModal] = useState(false)
	const settingsRef = useRef<HTMLDivElement>(null)

	// 바깥 클릭 시 설정 메뉴 닫기
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
			<div className="flex flex-col h-full w-18 py-2 border-r-[1px] relative">
				<div className="flex flex-col grow overflow-y-auto h-0">
					<div className="relative inset-0 overflow-y-auto">
						<NavButton href="/friend">친구</NavButton>
						<NavButton href="/message">DM</NavButton>
						<NavSepar />
						{roomDate.rooms.map((room) => (
							<NavButton
								key={`nav_room_link_${room.id}`}
								href={`/room/${room.id}`}
							>
								{room.name}
							</NavButton>
						))}
						{roomDate.rooms.length > 0 && <NavSepar />}
						<NavButton href="/">생성</NavButton>
						<NavButton href="/">검색</NavButton>
					</div>
				</div>

				{/* 설정 버튼 */}
				<div className="relative" ref={settingsRef}>
					<NavButton onClick={() => setShowSettings(!showSettings)}>
						설정
					</NavButton>
					{showSettings && (
						<div className="absolute right-[-180px] bottom-12 bg-background text-sm rounded shadow border w-40 z-50">
							<button
								className="w-full text-left px-4 py-2 hover:bg-gray-700"
								onClick={() => {
									setShowProfileModal(true)
									setShowSettings(false)
								}}
							>
								프로필 변경
							</button>
							<Link
								href="/logout"
								className="block px-4 py-2 hover:bg-gray-700"
							>
								로그아웃
							</Link>
						</div>
					)}
				</div>

				<NavButton href="/">프로필</NavButton>
			</div>

			{/* 프로필 변경 모달 */}
			{profile && (
				<ProfileEditModal
					open={showProfileModal}
					onClose={() => setShowProfileModal(false)}
					initialData={{
						userTag: profile.userTag,
						userName: profile.userName ?? '',
						image: profile.image ?? '/default-profile.png',
					}}
				/>
			)}
		</>
	)
}

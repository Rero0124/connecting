'use client'

import {
	setAllowedDmSession,
	setNotAllowedDmSession,
} from '@/src/lib/features/dm/dmSlice'
import {
	setFriends,
	setReceivedFriendRequests,
	setSentFriendRequests,
} from '@/src/lib/features/friend/friendSlice'
import { setRooms } from '@/src/lib/features/room/roomSlice'
import { setSession } from '@/src/lib/features/session/sessionSlice'
import {
	setInitLoadEnd,
	setProfile,
} from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { AuthChangeProfileBodySchema } from '@/src/lib/schemas/auth.schema'
import { DmSession } from '@/src/lib/schemas/dm.schema'
import { Friend, FriendRequest } from '@/src/lib/schemas/friend.schema'
import {
	GetProfilesByUserResponseSchema,
	Profile,
} from '@/src/lib/schemas/profile.schema'
import { Room } from '@/src/lib/schemas/room.schema'
import { VerifySession } from '@/src/lib/schemas/session.schema'
import { fetchWithValidation, serializeData } from '@/src/lib/util'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChangeProfileModal from '../profile/ChangeProfileModal'
import LoginModal from '../auth/LoginModal'
import MainNav from './MainNav'

type InitDataType = {
	session: VerifySession
	profile: Profile
	rooms: Room[]
	dmSessions: {
		allowedDmSessions: DmSession[]
		notAllowedDmSessions: DmSession[]
	}
	friends: Friend[]
	friendRequests: {
		receivedFriendRequests: FriendRequest[]
		sentFriendRequests: FriendRequest[]
	}
}

export const MainLayout = ({
	children,
	initData,
}: {
	children: React.ReactNode
	initData: InitDataType
}) => {
	const viewContextState = useAppSelector((state) => state.viewContext)
	const session = useAppSelector((state) => state.session.session)
	const friendState = useAppSelector((state) => state.friend)
	const dmState = useAppSelector((state) => state.dm)
	const roomState = useAppSelector((state) => state.room)

	const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false)
	const [openLoginModal, setOpenLoginModal] = useState(false)
	const [loginModalKey, setLoginModalKey] = useState(0)
	const [profiles, setProfiles] = useState<Profile[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [searchFocused, setSearchFocused] = useState(false)
	const [showNotifications, setShowNotifications] = useState(false)

	const dispatch = useAppDispatch()
	const router = useRouter()
	const searchRef = useRef<HTMLDivElement>(null)
	const notifRef = useRef<HTMLDivElement>(null)

	// 검색 결과 필터링
	const searchResults = searchQuery.trim().length > 0 ? {
		friends: friendState.friends.filter(
			(f) =>
				(f.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				f.tag.toLowerCase().includes(searchQuery.toLowerCase())
		),
		dms: dmState.allowedDmSessions.filter((dm) =>
			dm.name.toLowerCase().includes(searchQuery.toLowerCase())
		),
		rooms: roomState.rooms.filter((room) =>
			room.name.toLowerCase().includes(searchQuery.toLowerCase())
		),
	} : null

	const totalNotifications =
		friendState.receivedFriendRequests.length +
		dmState.notAllowedDmSessions.length

	// 외부 클릭 시 검색/알림 닫기
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setSearchFocused(false)
			}
			if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
				setShowNotifications(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const changeProfile = async () => {
		if (session?.isAuth) {
			const profileResponse = await fetchWithValidation(
				`/api/users/${session.userId}/profiles`,
				{
					dataSchema: GetProfilesByUserResponseSchema,
				}
			)

			if (profileResponse.status === 'success') {
				setOpenChangeProfileModal(true)
				setProfiles(profileResponse.data)
			}
		}
	}

	const selectProfile = async (profileId: bigint) => {
		const sessionResponse = await fetchWithValidation(`/api/session`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
			body: { profileId },
			bodySchema: AuthChangeProfileBodySchema,
		})

		if (sessionResponse.status === 'success') {
			location.reload()
		}
	}

	useEffect(() => {
		dispatch(setSession(serializeData(initData.session)))
		dispatch(setProfile(serializeData(initData.profile)))
		dispatch(setRooms(serializeData(initData.rooms)))
		dispatch(
			setAllowedDmSession(serializeData(initData.dmSessions.allowedDmSessions))
		)
		dispatch(
			setNotAllowedDmSession(
				serializeData(initData.dmSessions.notAllowedDmSessions)
			)
		)
		dispatch(setFriends(serializeData(initData.friends)))
		dispatch(
			setReceivedFriendRequests(
				serializeData(initData.friendRequests.receivedFriendRequests)
			)
		)
		dispatch(
			setSentFriendRequests(
				serializeData(initData.friendRequests.sentFriendRequests)
			)
		)
		setTimeout(() => {
			dispatch(setInitLoadEnd())
		}, 0)
	}, [])

	return (
		<div className="flex flex-col h-full">
			{viewContextState.initLoad ? (
				<>
					<header className="flex flex-row items-center justify-between h-14 border-b border-border bg-background-secondary/80 backdrop-blur-sm px-5 shrink-0">
						{/* 왼쪽 영역 - 프로필 */}
						<div className="flex-1 flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
								{(
									viewContextState.profile?.name ??
									viewContextState.profile?.tag ??
									'?'
								)
									.charAt(0)
									.toUpperCase()}
							</div>
							<p className="text-sm font-medium text-foreground">
								{viewContextState.profile?.name ??
									viewContextState.profile?.tag}
							</p>
						</div>

						{/* 중앙 제목 */}
						<div className="flex-none text-center">
							<h1 className="text-sm font-semibold text-foreground-muted tracking-wide">
								{viewContextState.title}
							</h1>
						</div>

						{/* 오른쪽 버튼들 */}
						<div className="flex-1 flex items-center justify-end gap-2">
							{/* 검색 */}
							<div className="relative" ref={searchRef}>
								<svg
									className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<circle cx="11" cy="11" r="8" />
									<path d="m21 21-4.3-4.3" />
								</svg>
								<input
									className="h-8 w-48 pl-8 pr-3 rounded-lg bg-background-light border border-border text-sm text-foreground placeholder:text-foreground-dim"
									placeholder="친구, DM, 방 검색..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onFocus={() => setSearchFocused(true)}
								/>
								{/* 검색 결과 드롭다운 */}
								{searchFocused && searchResults && (
									<div className="absolute top-full mt-1 right-0 w-72 bg-background-secondary border border-border-light rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
										{searchResults.friends.length === 0 &&
											searchResults.dms.length === 0 &&
											searchResults.rooms.length === 0 ? (
											<p className="px-4 py-6 text-xs text-foreground-dim text-center">
												검색 결과가 없습니다
											</p>
										) : (
											<>
												{searchResults.friends.length > 0 && (
													<>
														<div className="px-3 pt-2.5 pb-1">
															<span className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider">
																친구
															</span>
														</div>
														{searchResults.friends.map((friend) => (
															<button
																key={`search_friend_${friend.tag}`}
																className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-background-light transition-colors text-left"
																onClick={() => {
																	router.push(`/user/${friend.tag}`)
																	setSearchQuery('')
																	setSearchFocused(false)
																}}
															>
																<div className="relative w-7 h-7 shrink-0">
																	<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
																		{(friend.name ?? friend.tag).charAt(0).toUpperCase()}
																	</div>
																	<span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background-secondary ${friend.isOnline ? 'bg-online' : 'bg-offline'}`} />
																</div>
																<div className="min-w-0">
																	<p className="text-sm text-foreground truncate">{friend.name ?? friend.tag}</p>
																	<p className="text-[10px] text-foreground-dim">{friend.tag}</p>
																</div>
															</button>
														))}
													</>
												)}
												{searchResults.dms.length > 0 && (
													<>
														<div className="px-3 pt-2.5 pb-1">
															<span className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider">
																다이렉트 메시지
															</span>
														</div>
														{searchResults.dms.map((dm) => (
															<button
																key={`search_dm_${dm.id}`}
																className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-background-light transition-colors text-left"
																onClick={() => {
																	router.push(`/dm/session/${dm.id}`)
																	setSearchQuery('')
																	setSearchFocused(false)
																}}
															>
																<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">
																	{dm.name.charAt(0).toUpperCase()}
																</div>
																<span className="text-sm text-foreground truncate">{dm.name}</span>
															</button>
														))}
													</>
												)}
												{searchResults.rooms.length > 0 && (
													<>
														<div className="px-3 pt-2.5 pb-1">
															<span className="text-[10px] font-semibold text-foreground-dim uppercase tracking-wider">
																방
															</span>
														</div>
														{searchResults.rooms.map((room) => (
															<button
																key={`search_room_${room.id}`}
																className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-background-light transition-colors text-left"
																onClick={() => {
																	router.push(`/room/${room.id}`)
																	setSearchQuery('')
																	setSearchFocused(false)
																}}
															>
																<div className="w-7 h-7 rounded-full bg-background-room-icon flex items-center justify-center text-foreground text-[10px] font-bold shrink-0">
																	{room.name.charAt(0).toUpperCase()}
																</div>
																<span className="text-sm text-foreground truncate">{room.name}</span>
															</button>
														))}
													</>
												)}
											</>
										)}
									</div>
								)}
							</div>

							{/* 알림 */}
							<div className="relative" ref={notifRef}>
								<button
									className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-light text-foreground-muted hover:text-foreground relative"
									title="알림"
									onClick={() => setShowNotifications(!showNotifications)}
								>
									<svg
										className="w-[18px] h-[18px]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.8}
									>
										<path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
									</svg>
									{totalNotifications > 0 && (
										<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-white text-[9px] font-bold flex items-center justify-center">
											{totalNotifications > 9 ? '9+' : totalNotifications}
										</span>
									)}
								</button>
								{/* 알림 드롭다운 */}
								{showNotifications && (
									<div className="absolute top-full mt-1 right-0 w-72 bg-background-secondary border border-border-light rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
										<div className="px-4 py-3 border-b border-border">
											<span className="text-xs font-semibold text-foreground">알림</span>
										</div>
										{totalNotifications === 0 ? (
											<div className="flex flex-col items-center py-8 text-foreground-dim">
												<svg
													className="w-8 h-8 mb-2 opacity-30"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={1}
												>
													<path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
												</svg>
												<p className="text-xs">새 알림이 없습니다</p>
											</div>
										) : (
											<>
												{friendState.receivedFriendRequests.length > 0 && (
													<button
														className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-light transition-colors text-left"
														onClick={() => {
															router.push('/friend/request')
															setShowNotifications(false)
														}}
													>
														<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
															<svg
																className="w-4 h-4 text-accent"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
																strokeWidth={1.8}
															>
																<path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
															</svg>
														</div>
														<div className="min-w-0">
															<p className="text-sm text-foreground">친구 요청</p>
															<p className="text-xs text-foreground-muted">
																{friendState.receivedFriendRequests.length}개의 새로운 요청
															</p>
														</div>
													</button>
												)}
												{dmState.notAllowedDmSessions.length > 0 && (
													<button
														className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-light transition-colors text-left"
														onClick={() => {
															router.push('/dm/notAllow')
															setShowNotifications(false)
														}}
													>
														<div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
															<svg
																className="w-4 h-4 text-warning"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
																strokeWidth={1.8}
															>
																<path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
															</svg>
														</div>
														<div className="min-w-0">
															<p className="text-sm text-foreground">메시지 요청</p>
															<p className="text-xs text-foreground-muted">
																{dmState.notAllowedDmSessions.length}개의 대기 중인 메시지
															</p>
														</div>
													</button>
												)}
											</>
										)}
									</div>
								)}
							</div>

							<button
								onClick={changeProfile}
								className="h-8 px-3 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
							>
								프로필 변경
							</button>
						</div>
					</header>

					<div className="flex flex-row grow overflow-hidden">
						<MainNav />
						<main className="flex flex-row flex-1 overflow-hidden">
							{children}
						</main>
					</div>

					<ChangeProfileModal
						open={openChangeProfileModal}
						profiles={profiles}
						onClose={() => setOpenChangeProfileModal(false)}
						onSelect={selectProfile}
						onLoginAnotherAccount={() => {
							setOpenChangeProfileModal(false)
							setOpenLoginModal(true)
						}}
					/>

					<LoginModal
						key={loginModalKey}
						open={openLoginModal}
						onClose={() => setOpenLoginModal(false)}
					/>
				</>
			) : (
				<div className="flex items-center justify-center grow bg-background">
					<div className="flex flex-col items-center space-y-4">
						<div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
						<p className="text-sm text-foreground-muted">로딩 중...</p>
					</div>
				</div>
			)}
		</div>
	)
}

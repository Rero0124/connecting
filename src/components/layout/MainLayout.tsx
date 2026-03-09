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
import { useEffect, useState } from 'react'
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

	const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false)
	const [openLoginModal, setOpenLoginModal] = useState(false)
	const [loginModalKey, setLoginModalKey] = useState(0)
	const [profiles, setProfiles] = useState<Profile[]>([])

	const dispatch = useAppDispatch()

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
		dispatch(setSession(initData.session))
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
							<div className="relative">
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
									className="h-8 w-44 pl-8 pr-3 rounded-lg bg-background-light border border-border text-sm text-foreground placeholder:text-foreground-dim focus:w-56 transition-all"
									placeholder="검색..."
								/>
							</div>

							<button
								className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-light text-foreground-muted hover:text-foreground"
								title="알림"
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
							</button>

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
						<main className="flex-1 overflow-hidden">{children}</main>
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
				<div className="flex items-center justify-center h-screen bg-background">
					<div className="flex flex-col items-center space-y-4">
						<div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
						<p className="text-sm text-foreground-muted">로딩 중...</p>
					</div>
				</div>
			)}
		</div>
	)
}

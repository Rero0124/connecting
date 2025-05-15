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
import { fetchWithValidation, serializeDatesForRedux } from '@/src/lib/util'
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

	const selectProfile = async (profileId: number) => {
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
		dispatch(setProfile(serializeDatesForRedux(initData.profile)))
		dispatch(setRooms(serializeDatesForRedux(initData.rooms)))
		dispatch(
			setAllowedDmSession(
				serializeDatesForRedux(initData.dmSessions.allowedDmSessions)
			)
		)
		dispatch(
			setNotAllowedDmSession(
				serializeDatesForRedux(initData.dmSessions.notAllowedDmSessions)
			)
		)
		dispatch(setFriends(serializeDatesForRedux(initData.friends)))
		dispatch(
			setReceivedFriendRequests(
				serializeDatesForRedux(initData.friendRequests.receivedFriendRequests)
			)
		)
		dispatch(
			setSentFriendRequests(
				serializeDatesForRedux(initData.friendRequests.sentFriendRequests)
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
					<header className="flex flex-row items-center justify-between h-16 border-b border-foreground px-4">
						{/* 왼쪽 영역 */}
						<div className="flex-1 flex items-center pl-4">
							<p className="text-base font-medium">
								{viewContextState.profile?.name ??
									viewContextState.profile?.tag}
							</p>
						</div>

						{/* 중앙 제목 */}
						<div className="flex-none text-center">
							<h1 className="text-lg font-semibold">
								{viewContextState.title}
							</h1>
						</div>

						{/* 오른쪽 버튼들 */}
						<div className="flex-1 flex items-center justify-end gap-4 pr-4">
							<label className="flex items-center gap-2">
								<span>검색</span>
								<input
									className="h-10 px-3 py-1 rounded border border-gray-500"
									placeholder="검색어 입력"
								/>
							</label>

							<div className="w-10 h-10 flex items-center justify-center rounded bg-background-room-icon text-sm border border-gray-600">
								알림
							</div>

							<div className="w-10 h-10 flex items-center justify-center rounded bg-background-room-icon text-sm border border-gray-600">
								?
							</div>

							<button
								onClick={changeProfile}
								className="px-3 py-1 text-sm border border-gray-400 rounded hover:bg-gray-800"
							>
								프로필 변경
							</button>

							{/* <button
								onClick={handleRefresh}
								className="w-10 h-10 text-lg font-bold rounded border border-gray-400 hover:bg-gray-800 flex items-center justify-center"
								title="새로고침"
							>
								↻
							</button> */}
						</div>
					</header>

					<div className="flex flex-row grow">
						<MainNav />
						{children}
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
				<div className="flex items-center justify-center h-screen bg-black text-white">
					<div className="flex flex-col items-center space-y-4">
						<div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
						<p className="text-gray-400">로딩 중입니다...</p>
					</div>
				</div>
			)}
		</div>
	)
}

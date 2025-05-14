'use client'

import {
	setInitLoadEnd,
	setProfile,
} from '@/src/lib/features/saveData/saveDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { socket } from '@/src/lib/socket'
import { useEffect, useState } from 'react'
import Nav from '@/app/(main)/Nav'
import ChangeProfileModal from './changeProfileModal'
import LoginModal from './loginModal'
import {
	fetchWithValidation,
	getSession,
	promiseAll,
	serializeDatesForRedux,
} from '@/src/lib/util'
import {
	GetProfileByUserResponseSchema,
	GetProfilesByUserResponseSchema,
	Profile,
} from '@/src/lib/schemas/profile.schema'
import { AuthChangeProfileBodySchema } from '@/src/lib/schemas/auth.schema'
import { GetRoomsResponseSchema } from '@/src/lib/schemas/room.schema'
import { GetDmSessionsResponseSchema } from '@/src/lib/schemas/dm.schema'
import {
	GetFriendRequestsResponseSchema,
	GetFriendsResponseSchema,
} from '@/src/lib/schemas/friend.schema'
import {
	setFriends,
	setReceivedFriendRequests,
	setSentFriendRequests,
} from '@/src/lib/features/friendData/friendDataSlice'
import {
	setAllowedDmSession,
	setNotAllowedDmSession,
} from '@/src/lib/features/dmData/dmDataSlice'
import { setRooms } from '@/src/lib/features/roomData/roomDataSlice'
import { Socket } from 'socket.io'
import { SocketProvider } from './SocketProvider'
import { setSession } from '@/src/lib/features/session/sessionSlice'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false)
	const [openLoginModal, setOpenLoginModal] = useState(false)
	const [loginModalKey, setLoginModalKey] = useState(0)
	const [profiles, setProfiles] = useState<Profile[]>([])

	const saveData = useAppSelector((state) => state.saveData)
	const session = useAppSelector((state) => state.session.session)
	const dispatch = useAppDispatch()

	async function getInitData() {
		const newSession = await getSession()
		if (newSession.isAuth) {
			const responses = await promiseAll([
				fetchWithValidation(
					`${process.env.NEXT_PUBLIC_API_URL}/users/${newSession.userId}/profiles/${newSession.profileId}`,
					{
						cache: 'no-store',
						dataSchema: GetProfileByUserResponseSchema,
					}
				),
				fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
					cache: 'no-store',
					dataSchema: GetRoomsResponseSchema,
				}),
				fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions`, {
					cache: 'no-store',
					dataSchema: GetDmSessionsResponseSchema,
				}),
				fetchWithValidation(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
					cache: 'no-store',
					dataSchema: GetFriendsResponseSchema,
				}),
				fetchWithValidation(
					`${process.env.NEXT_PUBLIC_API_URL}/friend-requests`,
					{
						cache: 'no-store',
						dataSchema: GetFriendRequestsResponseSchema,
					}
				),
			])

			const [
				profileResponse,
				roomsResponse,
				dmSessionsResponse,
				friendsResponse,
				friendRequestsResponse,
			] = responses

			if (
				profileResponse.status === 'success' &&
				roomsResponse.status === 'success' &&
				dmSessionsResponse.status === 'success' &&
				friendsResponse.status === 'success' &&
				friendRequestsResponse.status === 'success'
			) {
				dispatch(setSession(newSession))
				dispatch(setProfile(serializeDatesForRedux(profileResponse.data)))
				dispatch(setRooms(serializeDatesForRedux(roomsResponse.data)))
				dispatch(
					setAllowedDmSession(
						serializeDatesForRedux(dmSessionsResponse.data.allowedDmSessions)
					)
				)
				dispatch(
					setNotAllowedDmSession(
						serializeDatesForRedux(dmSessionsResponse.data.notAllowedDmSessions)
					)
				)
				dispatch(setFriends(serializeDatesForRedux(friendsResponse.data)))
				dispatch(
					setReceivedFriendRequests(
						serializeDatesForRedux(
							friendRequestsResponse.data.receivedFriendRequests
						)
					)
				)
				dispatch(
					setSentFriendRequests(
						serializeDatesForRedux(
							friendRequestsResponse.data.sentFriendRequests
						)
					)
				)

				dispatch(setInitLoadEnd())
			}
		} else {
			location.reload()
		}
	}

	async function changeProfile() {
		if (session?.isAuth) {
			const profileResponse = await fetchWithValidation(
				`${process.env.NEXT_PUBLIC_API_URL}/users/${session.userId}/profiles`,
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

	async function selectProfile(profileId: number) {
		const sessionResponse = await fetchWithValidation(
			`${process.env.NEXT_PUBLIC_API_URL}/session`,
			{
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				cache: 'no-store',
				body: { profileId },
				bodySchema: AuthChangeProfileBodySchema,
			}
		)

		if (sessionResponse.status === 'success') {
			location.reload()
		}
	}

	useEffect(() => {
		if (!saveData.initLoad) {
			getInitData().then(async () => {
				if (session.isAuth) {
					socket.emit('set_profileId', session.profileId)
				}
			})
		}
	}, [session])

	return (
		<SocketProvider>
			<div className="flex flex-col h-full">
				{saveData.initLoad ? (
					<>
						<header className="flex flex-row items-center justify-between h-16 border-b border-foreground px-4">
							{/* 왼쪽 영역 */}
							<div className="flex-1 flex items-center pl-4">
								<p className="text-base font-medium">
									{saveData.profile?.name ?? saveData.profile?.tag}
								</p>
							</div>

							{/* 중앙 제목 */}
							<div className="flex-none text-center">
								<h1 className="text-lg font-semibold">{saveData.title}</h1>
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
							<Nav />
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
		</SocketProvider>
	)
}

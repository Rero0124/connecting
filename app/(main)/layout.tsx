'use client'

import {
	setInitLoadEnd,
	setProfile,
} from '@/src/lib/features/saveData/saveDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { socket } from '@/src/lib/socket'
import { useEffect, useState } from 'react'
import Nav from '@/app/(main)/Nav'
import { setRooms } from '@/src/lib/features/roomData/roomDataSlice'
import {
	setAllowedDmSession,
	setNotAllowedDmSession,
} from '@/src/lib/features/dmData/dmDataSlice'
import {
	setFriends,
	setReceivedFriendRequests,
	setSentFriendRequests,
} from '@/src/lib/features/friendData/friendDataSlice'
import ChangeProfileModal from './changeProfileModal'
import LoginModal from './loginModal'
import {
	DmSessionList,
	ErrorResponse,
	FriendList,
	FriendRequestList,
	ProfileDetail,
	ProfileList,
	RoomList,
	SuccessResponse,
} from '@/src/types/api'
import { VerifySessionType } from '@/src/lib/session'
import { getSession, promiseAll } from '@/src/lib/util'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false)
	const [openLoginModal, setOpenLoginModal] = useState(false)
	const [loginModalKey, setLoginModalKey] = useState(0)
	const [profiles, setProfiles] = useState<ProfileList>([])
	const [isConnected, setIsConnected] = useState(false)
	const [transport, setTransport] = useState('N/A')

	const saveData = useAppSelector((state) => state.saveData)
	const dispatch = useAppDispatch()

	async function getSaveData() {
		const session = await getSession()

		if (session.isLogin && session.authType === 'profile') {
			const [
				profileResponse,
				roomsResponse,
				dmSessionResponse,
				friendsResponse,
				friendRequestsResponse,
			] = await promiseAll<
				[
					SuccessResponse<ProfileDetail> | ErrorResponse,
					SuccessResponse<RoomList> | ErrorResponse,
					(
						| SuccessResponse<{
								allowedDmSessions: DmSessionList
								notAllowedDmSessions: DmSessionList
						  }>
						| ErrorResponse
					),
					SuccessResponse<FriendList> | ErrorResponse,
					(
						| SuccessResponse<{
								receivedfriendRequests: FriendRequestList
								sentfriendRequests: FriendRequestList
						  }>
						| ErrorResponse
					),
				]
			>([
				fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/users/${session.userId}/profiles/${session.profileId}`,
					{
						cache: 'no-store',
					}
				).then((res) => res.json()),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
					cache: 'no-store',
				}).then((res) => res.json()),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions`, {
					cache: 'no-store',
				}).then((res) => res.json()),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
					cache: 'no-store',
				}).then((res) => res.json()),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend-requests`, {
					cache: 'no-store',
				}).then((res) => res.json()),
			])

			if (
				profileResponse.status === 'success' &&
				roomsResponse.status === 'success' &&
				dmSessionResponse.status === 'success' &&
				friendsResponse.status === 'success' &&
				friendRequestsResponse.status === 'success'
			) {
				dispatch(setProfile(profileResponse.data))
				dispatch(setRooms(roomsResponse.data))
				dispatch(setAllowedDmSession(dmSessionResponse.data.allowedDmSessions))
				dispatch(
					setNotAllowedDmSession(dmSessionResponse.data.notAllowedDmSessions)
				)
				dispatch(setFriends(friendsResponse.data))
				dispatch(
					setSentFriendRequests(friendRequestsResponse.data.sentfriendRequests)
				)
				dispatch(
					setReceivedFriendRequests(
						friendRequestsResponse.data.receivedfriendRequests
					)
				)
				dispatch(setInitLoadEnd())
			}
		}
	}

	async function changeProfile() {
		const session = await getSession()

		if (session.isLogin) {
			const profileResponse: SuccessResponse<ProfileList> | ErrorResponse =
				await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/users/${session.userId}/profiles`
				).then((res) => res.json())

			if (profileResponse.status === 'success') {
				setOpenChangeProfileModal(true)
				setProfiles(profileResponse.data)
			}
		}
	}

	async function selectProfile(profileId: number) {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
			body: JSON.stringify({ profileId }),
		})

		if (res.status === 200) {
			location.reload()
		}
	}

	const handleRefresh = () => {
		location.reload()
	}

	useEffect(() => {
		if (!saveData.initLoad) {
			getSaveData().then(async () => {
				const session = await getSession()
				if (session.isLogin && session.authType === 'profile') {
					socket.emit('send userProfileId', session.profileId)
				}
			})
		}

		if (socket.connected) {
			onConnect()
		}

		function onConnect() {
			setIsConnected(true)
			setTransport(socket.io.engine.transport.name)

			socket.io.engine.on('upgrade', (transport) => {
				setTransport(transport.name)
			})
		}

		function onDisconnect() {
			setIsConnected(false)
			setTransport('N/A')
		}

		socket.on('connect', onConnect)
		socket.on('disconnect', onDisconnect)

		return () => {
			socket.off('connect', onConnect)
			socket.off('disconnect', onDisconnect)
		}
	}, [])

	return (
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
	)
}

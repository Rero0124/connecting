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
import { setAllowedDmSession, setNotAllowedDmSession } from '@/src/lib/features/dmData/dmDataSlice'
import { setFriends, setReceivedFriendRequests, setSentFriendRequests } from '@/src/lib/features/friendData/friendDataSlice'
import ChangeProfileModal from './changeProfileModal'
import LoginModal from './loginModal'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { VerifySessionType } from '@/src/lib/session'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false)
	const [openLoginModal, setOpenLoginModal] = useState(false)
	const [loginModalKey, setLoginModalKey] = useState(0)
	const [profiles, setProfiles] = useState<
		{
			id: number
			userTag: string
			userName?: string
			image: string
			createdAt: Date
		}[]
	>([])
	const [isConnected, setIsConnected] = useState(false)
	const [transport, setTransport] = useState('N/A')

	const saveData = useAppSelector((state) => state.saveData)
	const dispatch = useAppDispatch()

	async function getSaveData() {
		const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
			cache: 'no-store',
		}).then(res => res.json());

		if(sessionResponse.status === 'success' && sessionResponse.data && sessionResponse.data.authType === 'profile') {
			const profileResponse: SuccessResponse<{
				image: string;
				tag: string;
				id: number;
				userId: number;
				statusType: string;
				statusId: number;
				name: string | null;
				information: string;
				isCompany: boolean;
				isOnline: boolean;
				createdAt: Date;
		}> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${sessionResponse.data.userId}/profiles/${sessionResponse.data.profileId}`, {
				cache: 'no-store',
			}).then(res => res.json());
			const roomsResponse: SuccessResponse<{
				id: string;
				name: string;
				createdAt: Date;
				masterProfileId: number;
				iconType: string;
				iconData: string;
		}[]> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, { cache: 'no-store' }).then(res => res.json())
			const dmSessionResponse: SuccessResponse<{
				allowedDmSessions: {
					name: string
					id: string
					iconType: string
					iconData: string
					createdAt: Date
				}[]
				notAllowedDmSessions: {
					name: string
					id: string
					iconType: string
					iconData: string
					createdAt: Date
				}[]
			}> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions`, {
				cache: 'no-store',
			}).then(res => res.json())
			const friendsResponse: SuccessResponse<{
				image: string;
				tag: string;
				statusType: string;
				statusId: number;
				name: string | null;
				isOnline: boolean;
				createdAt: Date;
			}[]> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, { cache: 'no-store' }).then(res => res.json())
			const friendRequestsResponse: 
			SuccessResponse<{
				receivedfriendRequests: {
					profile: {
						statusType: string
						statusId: number
						tag: string
						name: string | null
						image: string
						isOnline: boolean
						createdAt: Date
					}
					id: number
					sentAt: Date
				}[]
				sentfriendRequests: {
					profile: {
						name: string | null
						image: string
						statusType: string
						statusId: number
						tag: string
						isOnline: boolean
						createdAt: Date
					}
					id: number
					sentAt: Date
				}[]
			}> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend-requests`, { cache: 'no-store' }).then(res => res.json())
		
	
			if (
				profileResponse.status === 'success' && roomsResponse.status === 'success' && dmSessionResponse.status === 'success' && friendsResponse.status === 'success' && friendRequestsResponse.status === 'success'
			) {
				dispatch(setProfile(profileResponse.data))
				dispatch(setRooms(roomsResponse.data))
				dispatch(setAllowedDmSession(dmSessionResponse.data.allowedDmSessions))
				dispatch(setNotAllowedDmSession(dmSessionResponse.data.notAllowedDmSessions))
				dispatch(setFriends(friendsResponse.data))
				dispatch(setSentFriendRequests(friendRequestsResponse.data.sentfriendRequests))
				dispatch(setReceivedFriendRequests(friendRequestsResponse.data.receivedfriendRequests))
				dispatch(setInitLoadEnd())
			}
		}
	}

	async function changeProfile() {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/check/profile`,
			{
				headers: { 'Content-Type': 'application/json' },
				cache: 'no-store',
			}
		)

		const data = await res.json()

		if (res.status === 200) {
			setOpenChangeProfileModal(true)
			setProfiles(data.profiles)
		}
	}

	async function selectProfile(profileId: number) {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change`, {
			method: 'POST',
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
				const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, { cache: 'no-store' })
					.then((res) => res.json())
				if(sessionResponse.status === 'success' && sessionResponse.data.authType === 'profile') {
					socket.emit('send userProfileId', sessionResponse.data.profileId);
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

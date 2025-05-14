'use client'

import {
	addDmMessage,
	setAllowedDmSession,
	setNotAllowedDmSession,
} from '@/src/lib/features/dmData/dmDataSlice'
import {
	setFriends,
	setReceivedFriendRequests,
	setSentFriendRequests,
} from '@/src/lib/features/friendData/friendDataSlice'
import {
	addRoomMessage,
	setRoomChannels,
	setRooms,
} from '@/src/lib/features/roomData/roomDataSlice'
import { setProfile } from '@/src/lib/features/saveData/saveDataSlice'
import { setSession } from '@/src/lib/features/session/sessionSlice'
import { setTransport } from '@/src/lib/features/socket/socketSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { GetDmSessionsResponseSchema } from '@/src/lib/schemas/dm.schema'
import {
	GetFriendRequestsResponseSchema,
	GetFriendsResponseSchema,
} from '@/src/lib/schemas/friend.schema'
import { GetProfileByUserResponseSchema } from '@/src/lib/schemas/profile.schema'
import {
	GetRoomChannelsResponseSchema,
	GetRoomsResponseSchema,
} from '@/src/lib/schemas/room.schema'
import { GetSessionResponseSchema } from '@/src/lib/schemas/session.schema'
import { socket } from '@/src/lib/socket'
import { fetchWithValidation, serializeDatesForRedux } from '@/src/lib/util'
import { useEffect, useRef } from 'react'

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const session = useAppSelector((state) => state.session.session)
	const sessionRef = useRef(session)

	const dispatch = useAppDispatch()

	useEffect(() => {
		sessionRef.current = session
	}, [session])

	useEffect(() => {
		if (socket.connected) {
			onConnect()
		}

		function onConnect() {
			dispatch(setTransport(socket.io.engine.transport.name))

			socket.io.engine.on('upgrade', (transport) => {
				dispatch(setTransport(transport.name))
			})

			socket.on('get_profileId', async () => {
				if (!sessionRef.current.isAuth) {
					const newSession = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/session`,
						{
							dataSchema: GetSessionResponseSchema,
						}
					)
					if (newSession.status === 'success' && newSession.data.isAuth) {
						socket.emit('set_profileId', newSession.data.profileId)
						dispatch(setSession(newSession.data))
					} else {
						location.reload()
					}
				} else {
					socket.emit('set_profileId', sessionRef.current.profileId)
				}
			})

			socket.on('loggedIn_sameProfile', () => {
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
					method: 'DELETE',
				}).then(() => {
					location.reload()
				})
			})

			socket.on('update_profile', async () => {
				;``
				if (sessionRef.current.isAuth) {
					const profileResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/users/${sessionRef.current.userId}/profiles/${sessionRef.current.profileId}`,
						{
							cache: 'no-store',
							dataSchema: GetProfileByUserResponseSchema,
						}
					)
					if (profileResponse.status === 'success') {
						dispatch(setProfile(serializeDatesForRedux(profileResponse.data)))
					}
				}
			})

			socket.on('update_rooms', async () => {
				if (sessionRef.current.isAuth) {
					const roomsResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/rooms`,
						{
							cache: 'no-store',
							dataSchema: GetRoomsResponseSchema,
						}
					)

					if (roomsResponse.status === 'success') {
						dispatch(setRooms(serializeDatesForRedux(roomsResponse.data)))
					}
				}
			})

			socket.on('update_dmSessions', async () => {
				if (sessionRef.current.isAuth) {
					const dmSessionsResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions`,
						{
							cache: 'no-store',
							dataSchema: GetDmSessionsResponseSchema,
						}
					)

					if (dmSessionsResponse.status === 'success') {
						dispatch(
							setAllowedDmSession(
								serializeDatesForRedux(
									dmSessionsResponse.data.allowedDmSessions
								)
							)
						)
						dispatch(
							setNotAllowedDmSession(
								serializeDatesForRedux(
									dmSessionsResponse.data.notAllowedDmSessions
								)
							)
						)
					}
				}
			})

			socket.on('update_friends', async () => {
				if (sessionRef.current.isAuth) {
					const friendsResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/friends`,
						{
							cache: 'no-store',
							dataSchema: GetFriendsResponseSchema,
						}
					)

					if (friendsResponse.status === 'success') {
						dispatch(setFriends(serializeDatesForRedux(friendsResponse.data)))
					}
				}
			})

			socket.on('update_friendRequests', async () => {
				if (sessionRef.current.isAuth) {
					const friendRequestsResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/friend-requests`,
						{
							cache: 'no-store',
							dataSchema: GetFriendRequestsResponseSchema,
						}
					)

					if (friendRequestsResponse.status === 'success') {
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
					}
				}
			})

			socket.on('update_roomChannels', async (roomId) => {
				if (sessionRef.current.isAuth) {
					const roomChannelsResponse = await fetchWithValidation(
						`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/channels`,
						{
							cache: 'no-store',
							dataSchema: GetRoomChannelsResponseSchema,
						}
					)

					if (roomChannelsResponse.status === 'success') {
						dispatch(
							setRoomChannels(serializeDatesForRedux(roomChannelsResponse.data))
						)
					}
				}
			})

			socket.on('received_dmMessage', (dmMessage) => {
				dispatch(addDmMessage(serializeDatesForRedux(dmMessage)))
			})

			socket.on('received_roomMessage', (roomMessage) => {
				dispatch(addRoomMessage(serializeDatesForRedux(roomMessage)))
			})
		}

		function onDisconnect() {
			dispatch(setTransport('N/A'))
		}

		socket.on('connect', onConnect)
		socket.on('disconnect', onDisconnect)

		return () => {
			socket.off('connect', onConnect)
			socket.off('disconnect', onDisconnect)
		}
	}, [])
	return <>{children}</>
}

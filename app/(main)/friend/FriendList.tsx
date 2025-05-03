'use client'

import { setSelectedFriendSubMenu } from '@/src/lib/features/saveData/saveDataSlice'
import { useAppDispatch } from '@/src/lib/hooks'
import { RootState } from '@/src/lib/store'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Image from 'next/image'

type FriendStatus = 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'

const getStatusColor = (status: string): string => {
	switch (status) {
		case 'ONLINE':
			return 'bg-green-500'
		case 'AWAY':
			return 'bg-yellow-400'
		case 'DO_NOT_DISTURB':
			return 'bg-red-600'
		default:
			return 'bg-gray-500'
	}
}

export default function FriendList() {
	const { friends } = useSelector((state: RootState) => state.friendsData)
	const { selectedFriendSubMenu } = useSelector(
		(state: RootState) => state.saveData
	)
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (!['all', 'online', 'favorite'].includes(selectedFriendSubMenu)) {
			dispatch(setSelectedFriendSubMenu('all'))
		}
	}, [])

	function Menu({
		children,
		name,
		classname = '',
	}: {
		children: React.ReactNode
		name: string
		classname?: string
	}) {
		const onClick = () => dispatch(setSelectedFriendSubMenu(name))

		return (
			<div
				className={`cursor-pointer w-24 h-9 px-3 py-1 ml-2 my-2 rounded text-center text-sm leading-7 ${
					selectedFriendSubMenu === name
						? 'bg-zinc-800 text-white'
						: 'hover:bg-zinc-700 text-gray-300'
				} ${classname}`}
				onClick={onClick}
			>
				{children}
			</div>
		)
	}

	return (
		<div className="flex flex-col">
			{/* 메뉴바 */}
			<div className="flex flex-row h-13 border-b border-zinc-700">
				<Menu name="all">모두</Menu>
				<Menu name="online">온라인</Menu>
				<Menu name="favorite">친한친구</Menu>
			</div>

			{/* 친구 목록 */}
			<div className="flex flex-col grow px-4 pt-4 gap-3">
				{friends.map((friend) => (
					<div
						key={`key_friend_${friend.tag}`}
						className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 cursor-pointer"
					>
						{/* 프로필 이미지 */}
						<div className="relative w-10 h-10">
							<Image
								src={friend.image || '/default-profile.png'}
								alt="profile"
								fill
								className="rounded-full object-cover"
							/>
							<span
								className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(
									friend.statusType
								)}`}
							/>
						</div>

						{/* 이름 + 상태 */}
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-white">
								{friend.name ?? friend.tag}
							</span>
							<span className="text-xs text-gray-400">
								{friend.information || ''}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

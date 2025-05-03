'use client'

import { RootState } from '@/src/lib/store'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type FriendStatus = 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'

interface Friend {
	tag: string
	name?: string | null
	image?: string
	statusType: string
	information?: string
}

const getStatusLabel = (status: string): string => {
	switch (status) {
		case 'ONLINE':
			return '온라인'
		case 'AWAY':
			return '자리 비움'
		case 'DO_NOT_DISTURB':
			return '방해 금지'
		default:
			return '오프라인'
	}
}

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

const order: Record<FriendStatus, number> = {
	ONLINE: 0,
	AWAY: 1,
	DO_NOT_DISTURB: 2,
	OFFLINE: 3,
}

export default function FriendManage() {
	const friendsData = useSelector((state: RootState) => state.friendsData)
	const sortedFriends = [...friendsData.friends].sort(
		(a: Friend, b: Friend) =>
			order[a.statusType as FriendStatus] - order[b.statusType as FriendStatus]
	)

	const [activeFriendTag, setActiveFriendTag] = useState<string | null>(null)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const router = useRouter()

	// 외부 클릭 시 더보기 메뉴 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setActiveFriendTag(null)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleDeleteFriend = (tag: string) => {
		if (confirm(`${tag}님을 친구 목록에서 삭제하시겠습니까?`)) {
			fetch(`/api/friends/${tag}`, {
				method: 'DELETE',
			}).then(() => {
				alert('삭제되었습니다.')
			})
		}
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			{sortedFriends.map((friend: Friend) => (
				<div
					key={`key_friend_${friend.tag}`}
					className="flex items-center justify-between bg-zinc-900 p-3 rounded hover:bg-zinc-800"
				>
					{/* 좌측: 프로필 + 정보 */}
					<div className="flex items-center gap-3">
						{/* 프로필 이미지 */}
						<div className="relative w-10 h-10">
							<Image
								src={friend.image || '/default-profile.png'}
								alt="프로필"
								fill
								className="rounded-full object-cover"
							/>
							<span
								className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${getStatusColor(
									friend.statusType
								)}`}
							></span>
						</div>

						{/* 이름 및 정보 */}
						<div className="flex flex-col">
							<span className="font-semibold">{friend.name ?? friend.tag}</span>
							<span className="text-sm text-gray-400">
								{getStatusLabel(friend.statusType)}
								{friend.information ? ` · ${friend.information}` : ''}
							</span>
						</div>
					</div>

					{/* 우측: 메시지 & 더보기 */}
					<div className="flex items-center gap-2">
						{/* 메시지 이동 */}
						<button
							title="메시지"
							className="text-sm text-blue-400 hover:underline"
							onClick={() => router.push(`/message/${friend.tag}`)}
						>
							메세지
						</button>

						{/* 더보기 버튼 */}
						<div className="relative">
							<button
								title="더 보기"
								className="text-gray-400 text-xl px-2 cursor-pointer hover:text-white"
								onClick={() =>
									setActiveFriendTag((prev) =>
										prev === friend.tag ? null : friend.tag
									)
								}
							>
								⋮
							</button>

							{activeFriendTag === friend.tag && (
								<div
									ref={menuRef}
									className="absolute right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded shadow-lg z-10"
								>
									<button
										className="px-4 py-2 text-sm text-red-500 hover:bg-zinc-700 text-center whitespace-nowrap"
										onClick={() => handleDeleteFriend(friend.tag)}
									>
										친구 삭제하기
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

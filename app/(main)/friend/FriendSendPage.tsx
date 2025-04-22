'use client'
import { useEffect, useState } from 'react'
import FriendDetailModal from './FriendDetailModal'

interface FriendInfo {
	userTag: string
	userName?: string
	image?: string
	createdAt: string
}

export default function FriendSendPage() {
	const [friends, setFriends] = useState<Map<string, FriendInfo>>(new Map())
	const [loading, setLoading] = useState(true)
	const [selectedFriend, setSelectedFriend] = useState<FriendInfo | null>(null)

	// row 클릭 시 호출되는 함수
	const handleRowClick = (friend: FriendInfo) => {
		setSelectedFriend(friend)
	}

	// 친구 목록 갱신
	const updateSendList = async () => {
		try {
			const res = await fetch('/api/friend/request')
			const data = await res.json()

			if (data.send && Array.isArray(data.send)) {
				const updatedMap = new Map(friends)
				data.send.forEach((friend: FriendInfo) => {
					updatedMap.set(friend.userTag, friend)
				})
				setFriends(updatedMap)
			}
		} catch (err) {
			console.error('친구 리스트 갱신 실패', err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		updateSendList()
	}, [])

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">보낸 친구 신청</h2>
			{loading ? (
				<p>로딩 중...</p>
			) : friends.size === 0 ? (
				<p>보낸 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{[...friends.values()].map((friend) => (
						<li
							key={friend.userTag}
							className="border p-3 rounded flex justify-between items-center hover:bg-gray-100"
							onClick={() => handleRowClick(friend)}
						>
							<div className="cursor-pointer">
								<div className="font-medium">
									{friend.userName || friend.userTag}
								</div>
								<div className="text-sm text-gray-500">
									{new Date(friend.createdAt).toLocaleString()}
								</div>
							</div>

							<div className="flex gap-2">
								<button
									className="text-red-600 hover:underline"
									onClick={(e) => {
										e.stopPropagation() // 이벤트 버블링 방지
										alert('취소 기능은 아직 구현되지 않았습니다.')
									}}
								>
									❌
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

			{selectedFriend && (
				<FriendDetailModal
					friend={selectedFriend}
					onClose={() => setSelectedFriend(null)}
					onAccept={() => {
						alert('수락 기능은 아직 미구현입니다.')
						setSelectedFriend(null)
					}}
					onCancel={() => {
						alert('취소 기능은 아직 미구현입니다.')
						setSelectedFriend(null)
					}}
				/>
			)}
		</div>
	)
}

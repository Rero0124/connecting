'use client'
import { useEffect, useState } from 'react'

interface FriendInfo {
	userTag: string
	userName?: string
	image?: string
	createdAt: string
}

export default function FriendReceivePage() {
	const [friends, setFriends] = useState<FriendInfo[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch('/api/friend/request')
			.then((res) => res.json())
			.then((data) => {
				setFriends(data.receive || [])
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [])

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">받은 친구 신청</h2>
			{loading ? (
				<p>로딩 중...</p>
			) : friends.length === 0 ? (
				<p>받은 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{friends.map((friend, index) => (
						<li key={index} className="border p-2 rounded">
							<div>{friend.userName || friend.userTag}</div>
							<div className="text-sm text-gray-500">
								{new Date(friend.createdAt).toLocaleString()}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

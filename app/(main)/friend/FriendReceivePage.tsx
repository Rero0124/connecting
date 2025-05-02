'use client'

import { useAppSelector } from '@/src/lib/hooks'

export default function FriendReceivePage() {
	const friendsData = useAppSelector((state) => state.friendsData)

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">받은 친구 신청</h2>
			{friendsData.receivedFriendRequests.length === 0 ? (
				<p>받은 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{friendsData.receivedFriendRequests.map((friend, index) => (
						<li key={index} className="border p-2 rounded">
							<div>{friend.profile.name || friend.profile.tag}</div>
							<div className="text-sm text-gray-500">
								{new Date(friend.sentAt).toLocaleString()}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

'use client'
import { useEffect, useState } from 'react'
import FriendDetailModal from './FriendDetailModal'
import { useAppSelector } from '@/src/lib/hooks'
import { FriendRequestType } from '@/src/lib/features/friendData/friendDataSlice'

export default function FriendSendPage() {
	const friendsData = useAppSelector((state) => state.friendsData)
	const [selectedFriendRequest, setSelectedFriendRequest] =
		useState<FriendRequestType | null>(null)

	// row 클릭 시 호출되는 함수
	const handleRowClick = (friendRequest: FriendRequestType) => {
		setSelectedFriendRequest(friendRequest)
	}

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">보낸 친구 신청</h2>
			{friendsData.sentFriendRequests.length === 0 ? (
				<p>보낸 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{friendsData.sentFriendRequests.map((friendRequest) => (
						<li
							key={friendRequest.profile.tag}
							className="border p-3 rounded flex justify-between items-center hover:bg-gray-100"
							onClick={() => handleRowClick(friendRequest)}
						>
							<div className="cursor-pointer">
								<div className="font-medium">
									{friendRequest.profile.name || friendRequest.profile.tag}
								</div>
								<div className="text-sm text-gray-500">
									{new Date(friendRequest.sentAt).toLocaleString()}
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

			{selectedFriendRequest && (
				<FriendDetailModal
					friendRequest={selectedFriendRequest}
					onClose={() => setSelectedFriendRequest(null)}
					onAccept={() => {
						alert('수락 기능은 아직 미구현입니다.')
						setSelectedFriendRequest(null)
					}}
					onCancel={() => {
						alert('취소 기능은 아직 미구현입니다.')
						setSelectedFriendRequest(null)
					}}
				/>
			)}
		</div>
	)
}

'use client'

import { useAppSelector } from '@/src/lib/hooks'
import FriendDetailModal from './FriendDetailModal'
import { useState } from 'react'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'

export default function FriendReceivePage() {
	const friendsData = useAppSelector((state) => state.friendsData)
	const [selectedFriendRequestId, setSelectedFriendRequestId] =
		useState<number>()

	const handleFriendRequestAccept = async (friendRequestId: number) => {
		try {
			const response: SuccessResponse | ErrorResponse = await fetch(
				`/api/friend-requests/${friendRequestId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ type: 'accept' }),
				}
			).then((res) => res.json())

			alert(response.message)
		} catch (err) {
			alert('알 수 없는 오류가 발생했어요요')
		}
	}

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">받은 친구 신청</h2>
			{friendsData.receivedFriendRequests.length === 0 ? (
				<p>받은 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{friendsData.receivedFriendRequests.map((friendRequest, index) => (
						<li
							key={index}
							className="border p-3 rounded flex justify-between items-center hover:bg-gray-100"
						>
							<div className="cursor-pointer">
								<div>
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
										handleFriendRequestAccept(friendRequest.id)
									}}
								>
									⭕
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
			{selectedFriendRequestId && (
				<FriendDetailModal
					friendRequestId={selectedFriendRequestId}
					type="receive"
					onClose={() => setSelectedFriendRequestId(undefined)}
					onAccept={() => {
						if (selectedFriendRequestId) {
							handleFriendRequestAccept(selectedFriendRequestId)
							setSelectedFriendRequestId(undefined)
						}
					}}
				/>
			)}
		</div>
	)
}

'use client'
import { useEffect, useState } from 'react'
import FriendDetailModal from './FriendDetailModal'
import { useAppSelector } from '@/src/lib/hooks'
import { fetchWithValidation } from '@/src/lib/util'
import { UpdateFriendRequestBodySchema } from '@/src/lib/schemas/friend.schema'

export default function FriendSendPage() {
	const friendsData = useAppSelector((state) => state.friendsData)
	const [selectedFriendRequestId, setSelectedFriendRequestId] =
		useState<number>()

	// row 클릭 시 호출되는 함수
	const handleRowClick = (friendRequestId: number) => {
		setSelectedFriendRequestId(friendRequestId)
	}

	const handleFriendRequestCancel = async (friendRequestId: number) => {
		try {
			const response = await fetchWithValidation(
				`/api/friend-requests/${friendRequestId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: { type: 'cancel' },
					bodySchema: UpdateFriendRequestBodySchema,
				}
			)

			alert(response.message)
		} catch (err) {
			alert('알 수 없는 오류가 발생했어요요')
		}
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
							onClick={() => handleRowClick(friendRequest.id)}
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
										handleFriendRequestCancel(friendRequest.id)
									}}
								>
									❌
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

			{selectedFriendRequestId && (
				<FriendDetailModal
					friendRequestId={selectedFriendRequestId}
					type="send"
					onClose={() => setSelectedFriendRequestId(undefined)}
					onCancel={() => {
						if (selectedFriendRequestId) {
							handleFriendRequestCancel(selectedFriendRequestId)
							setSelectedFriendRequestId(undefined)
						}
					}}
				/>
			)}
		</div>
	)
}

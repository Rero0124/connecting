'use client'

import { useAppSelector } from '@/src/lib/hooks'
import FriendDetailModal from './FriendDetailModal'
import { useState } from 'react'
import { fetchWithValidation } from '@/src/lib/util'
import { UpdateFriendRequestBodySchema } from '@/src/lib/schemas/friend.schema'

export default function FriendReceivePage() {
	const initialRequests = useAppSelector(
		(state) => state.friend.receivedFriendRequests
	)
	const [receivedFriendRequests, setReceivedFriendRequests] =
		useState(initialRequests)
	const [selectedFriendRequestId, setSelectedFriendRequestId] =
		useState<number>()

	const handleFriendRequestAccept = async (friendRequestId: number) => {
		try {
			const response = await fetchWithValidation(
				`/api/friend-requests/${friendRequestId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: { type: 'accept' },
					bodySchema: UpdateFriendRequestBodySchema,
				}
			)

			alert(response.message)

			if (response.status === 'success') {
				setReceivedFriendRequests((prev) =>
					prev.filter((req) => req.id !== friendRequestId)
				)
				setSelectedFriendRequestId(undefined)
			}
		} catch {
			alert('알 수 없는 오류가 발생했어요.')
		}
	}

	const handleFriendRequestReject = async (friendRequestId: number) => {
		try {
			const response = await fetchWithValidation(
				`/api/friend-requests/${friendRequestId}`,
				{
					method: 'DELETE',
				}
			)

			alert(response.message)

			if (response.status === 'success') {
				setReceivedFriendRequests((prev) =>
					prev.filter((req) => req.id !== friendRequestId)
				)
				setSelectedFriendRequestId(undefined)
			}
		} catch {
			alert('알 수 없는 오류가 발생했어요.')
		}
	}

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">받은 친구 신청</h2>
			{receivedFriendRequests.length === 0 ? (
				<p>받은 친구 신청이 없습니다.</p>
			) : (
				<ul className="space-y-3">
					{receivedFriendRequests.map((friendRequest) => (
						<li
							key={friendRequest.id}
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
								{/* 수락 */}
								<button
									className="text-green-600 hover:underline"
									onClick={(e) => {
										e.stopPropagation()
										handleFriendRequestAccept(friendRequest.id)
									}}
								>
									⭕
								</button>
								{/* 거절 */}
								<button
									className="text-red-600 hover:underline"
									onClick={(e) => {
										e.stopPropagation()
										handleFriendRequestReject(friendRequest.id)
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
					type="receive"
					onClose={() => setSelectedFriendRequestId(undefined)}
					onAccept={() => {
						if (selectedFriendRequestId) {
							handleFriendRequestAccept(selectedFriendRequestId)
						}
					}}
				/>
			)}
		</div>
	)
}

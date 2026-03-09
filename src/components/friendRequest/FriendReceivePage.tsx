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
		useState<bigint>()

	const handleFriendRequestAccept = async (friendRequestId: bigint) => {
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

	const handleFriendRequestReject = async (friendRequestId: bigint) => {
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
		<div className="flex flex-col gap-4 p-6">
			<div>
				<h2 className="text-lg font-bold text-foreground">받은 친구 신청</h2>
				<p className="text-sm text-foreground-muted mt-1">
					{receivedFriendRequests.length}개의 신청이 있습니다
				</p>
			</div>

			{receivedFriendRequests.length === 0 ? (
				<div className="flex flex-col items-center py-12 text-foreground-dim">
					<svg
						className="w-12 h-12 mb-3 opacity-30"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1}
					>
						<path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
					</svg>
					<p className="text-sm">받은 친구 신청이 없습니다</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{receivedFriendRequests.map((friendRequest) => (
						<div
							key={friendRequest.id}
							className="flex items-center justify-between p-3 bg-background-light border border-border rounded-xl hover:border-border-light transition-colors group"
						>
							<div
								className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
								onClick={() => setSelectedFriendRequestId(friendRequest.id)}
							>
								<div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
									{(friendRequest.profile.name || friendRequest.profile.tag)
										.charAt(0)
										.toUpperCase()}
								</div>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground truncate">
										{friendRequest.profile.name || friendRequest.profile.tag}
									</p>
									<p className="text-xs text-foreground-dim">
										{new Date(friendRequest.sentAt).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-1.5 shrink-0">
								<button
									className="h-8 px-3 text-xs font-medium rounded-lg bg-success/15 text-success hover:bg-success/25 transition-colors"
									onClick={(e) => {
										e.stopPropagation()
										handleFriendRequestAccept(friendRequest.id)
									}}
								>
									수락
								</button>
								<button
									className="h-8 px-3 text-xs font-medium rounded-lg bg-danger/15 text-danger hover:bg-danger/25 transition-colors"
									onClick={(e) => {
										e.stopPropagation()
										handleFriendRequestReject(friendRequest.id)
									}}
								>
									거절
								</button>
							</div>
						</div>
					))}
				</div>
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

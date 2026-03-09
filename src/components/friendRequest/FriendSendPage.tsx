'use client'
import { useEffect, useState } from 'react'
import FriendDetailModal from './FriendDetailModal'
import { useAppSelector } from '@/src/lib/hooks'
import { fetchWithValidation } from '@/src/lib/util'
import { UpdateFriendRequestBodySchema } from '@/src/lib/schemas/friend.schema'

export default function FriendSendPage() {
	const friendState = useAppSelector((state) => state.friend)
	const [selectedFriendRequestId, setSelectedFriendRequestId] =
		useState<bigint>()

	// row 클릭 시 호출되는 함수
	const handleRowClick = (friendRequestId: bigint) => {
		setSelectedFriendRequestId(friendRequestId)
	}

	const handleFriendRequestCancel = async (friendRequestId: bigint) => {
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
		<div className="flex flex-col gap-4 p-6">
			<div>
				<h2 className="text-lg font-bold text-foreground">보낸 친구 신청</h2>
				<p className="text-sm text-foreground-muted mt-1">
					{friendState.sentFriendRequests.length}개의 보낸 신청
				</p>
			</div>

			{friendState.sentFriendRequests.length === 0 ? (
				<div className="flex flex-col items-center py-12 text-foreground-dim">
					<svg
						className="w-12 h-12 mb-3 opacity-30"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1}
					>
						<path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
					</svg>
					<p className="text-sm">보낸 친구 신청이 없습니다</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{friendState.sentFriendRequests.map((friendRequest) => (
						<div
							key={friendRequest.profile.tag}
							className="flex items-center justify-between p-3 bg-background-light border border-border rounded-xl hover:border-border-light transition-colors cursor-pointer"
							onClick={() => handleRowClick(friendRequest.id)}
						>
							<div className="flex items-center gap-3 flex-1 min-w-0">
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
							<button
								className="h-8 px-3 text-xs font-medium rounded-lg bg-danger/15 text-danger hover:bg-danger/25 transition-colors shrink-0"
								onClick={(e) => {
									e.stopPropagation()
									handleFriendRequestCancel(friendRequest.id)
								}}
							>
								취소
							</button>
						</div>
					))}
				</div>
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

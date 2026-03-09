'use client'

import { getFriendRequests } from '@/src/lib/features/friend/friendSlice'
import { useAppSelector } from '@/src/lib/hooks'
import { deserializeData } from '@/src/lib/util'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface FriendDetailModalProps {
	friendRequestId: bigint
	type: 'send' | 'receive'
	onClose: () => void
	onAccept?: () => void
	onCancel?: () => void
}

export default function FriendDetailModal({
	friendRequestId,
	type,
	onClose,
	onAccept,
	onCancel,
}: FriendDetailModalProps) {
	const friendState = useAppSelector((state) => state.friend)
	const [friendRequest, setFriendRequest] = useState<{
		profile: {
			statusType: string
			statusId: bigint
			tag: string
			name: string | null
			image: string
			isOnline: boolean
			createdAt: Date
		}
		id: bigint
		sentAt: Date
	}>()
	useEffect(() => {
		if (friendRequestId) {
			const request = getFriendRequests(friendState, friendRequestId)
			if (request && !Array.isArray(request)) {
				setFriendRequest(deserializeData(request))
			}
		}
	}, [friendRequestId])

	if (!friendRequest) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[380px] overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Banner + Avatar */}
				<div className="h-20 bg-gradient-to-r from-accent/50 to-accent/20 relative">
					<div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
						{friendRequest.profile.image ? (
							<Image
								src={friendRequest.profile.image}
								alt="profile"
								width={64}
								height={64}
								className="w-16 h-16 rounded-2xl border-4 border-background-secondary object-cover"
							/>
						) : (
							<div className="w-16 h-16 rounded-2xl border-4 border-background-secondary bg-accent/20 flex items-center justify-center text-accent text-lg font-bold">
								{(friendRequest.profile.name || friendRequest.profile.tag)
									.charAt(0)
									.toUpperCase()}
							</div>
						)}
					</div>
				</div>

				{/* Info */}
				<div className="pt-12 px-6 pb-2 text-center">
					<h3 className="text-base font-bold text-foreground">
						{friendRequest.profile.name || friendRequest.profile.tag}
					</h3>
					<p className="text-xs text-foreground-dim mt-0.5">
						{friendRequest.profile.tag}
					</p>
				</div>

				{/* Details */}
				<div className="px-6 py-3">
					<div className="flex items-center justify-between py-2 border-t border-border">
						<span className="text-xs text-foreground-dim">요청일</span>
						<span className="text-xs text-foreground-muted">
							{friendRequest.sentAt.toLocaleDateString()}
						</span>
					</div>
					<div className="flex items-center justify-between py-2 border-t border-border">
						<span className="text-xs text-foreground-dim">상태</span>
						<div className="flex items-center gap-1.5">
							<span
								className={`w-2 h-2 rounded-full ${friendRequest.profile.isOnline ? 'bg-online' : 'bg-offline'}`}
							/>
							<span className="text-xs text-foreground-muted">
								{friendRequest.profile.isOnline ? '온라인' : '오프라인'}
							</span>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2 px-6 pb-6">
					<button
						onClick={onClose}
						className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
					>
						닫기
					</button>
					{type === 'receive' && onAccept && (
						<button
							onClick={onAccept}
							className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
						>
							수락
						</button>
					)}
					{type === 'send' && onCancel && (
						<button
							onClick={onCancel}
							className="flex-1 h-10 rounded-xl bg-danger/15 text-danger hover:bg-danger/25 text-sm font-medium transition-colors"
						>
							취소
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

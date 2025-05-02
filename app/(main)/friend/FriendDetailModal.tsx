'use client'

import { getFriendRequests } from '@/src/lib/features/friendData/friendDataSlice'
import { useAppSelector } from '@/src/lib/hooks'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface FriendDetailModalProps {
	friendRequestId: number
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
	const friendsData = useAppSelector((state) => state.friendsData)
	const [friendRequest, setFriendRequest] = useState<{
		profile: {
			statusType: string
			statusId: number
			tag: string
			name: string | null
			image: string
			isOnline: boolean
			createdAt: Date
		}
		id: number
		sentAt: Date
	}>()
	useEffect(() => {
		if (friendRequestId) {
			const request = getFriendRequests(friendsData, friendRequestId)
			if (request && !Array.isArray(request)) {
				setFriendRequest(request)
			}
		}
	}, [friendRequestId])

	return (
		friendRequest && (
			<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
				<div className="bg-[#1e1e1e] text-gray-200 p-6 rounded-md w-[400px] shadow-lg border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 border-b pb-2">
						친구 상세 정보
					</h3>

					<div className="mb-3">
						<p className="mb-1">
							<span className="text-gray-400">닉네임:</span>{' '}
							{friendRequest.profile.name || '(미입력)'}
						</p>
						<p className="mb-1">
							<span className="text-gray-400">태그:</span>{' '}
							{friendRequest.profile.tag}
						</p>
						<p className="mb-1">
							<span className="text-gray-400">요청일:</span>{' '}
							{new Date(friendRequest.sentAt).toLocaleString()}
						</p>
					</div>

					{friendRequest.profile.image && (
						<div className="mb-4">
							<Image
								src={friendRequest.profile.image}
								alt="profile"
								width={0}
								height={0}
								className="w-20 h-20 rounded-full border border-gray-500 object-cover"
							/>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-4">
						{type === 'receive' && (
							<button
								onClick={onAccept}
								className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
							>
								⭕ 승인
							</button>
						)}
						{type === 'send' && (
							<button
								onClick={onCancel}
								className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
							>
								✖️ 취소
							</button>
						)}
						<button
							onClick={onClose}
							className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
						>
							닫기
						</button>
					</div>
				</div>
			</div>
		)
	)
}

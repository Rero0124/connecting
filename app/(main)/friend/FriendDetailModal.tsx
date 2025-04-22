'use client'

import Image from 'next/image'

interface FriendInfo {
	userTag: string
	userName?: string
	image?: string
	createdAt: string
}

interface FriendDetailModalProps {
	friend: FriendInfo
	onClose: () => void
	onAccept?: () => void
	onCancel?: () => void
}

export default function FriendDetailModal({
	friend,
	onClose,
	onAccept,
	onCancel,
}: FriendDetailModalProps) {
	return (
		<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
			<div className="bg-[#1e1e1e] text-gray-200 p-6 rounded-md w-[400px] shadow-lg border border-gray-700">
				<h3 className="text-xl font-semibold mb-4 border-b pb-2">
					친구 상세 정보
				</h3>

				<div className="mb-3">
					<p className="mb-1">
						<span className="text-gray-400">닉네임:</span>{' '}
						{friend.userName || '(미입력)'}
					</p>
					<p className="mb-1">
						<span className="text-gray-400">태그:</span> {friend.userTag}
					</p>
					<p className="mb-1">
						<span className="text-gray-400">요청일:</span>{' '}
						{new Date(friend.createdAt).toLocaleString()}
					</p>
				</div>

				{friend.image && (
					<div className="mb-4">
						<Image
							src={friend.image}
							alt="profile"
							className="w-20 h-20 rounded-full border border-gray-500 object-cover"
						/>
					</div>
				)}

				<div className="flex justify-end gap-2 mt-4">
					<button
						onClick={onCancel}
						className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
					>
						✖️ 취소
					</button>
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
}

'use client'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
import { useState } from 'react'

export default function FriendAddPage() {
	const [tag, setTag] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [status, setStatus] = useState<'success' | 'error' | null>(null)

	const handleSubmit = async () => {
		if (!tag.trim()) return

		try {
			const response: SuccessResponse | ErrorResponse = await fetch('/api/friend-requests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ tag: tag }),
			}).then(res => res.json())

			if (response.status === 'success') {
				setStatus('success')
				setMessage('친구 요청을 보냈어요.')
				setTag('') // 입력 초기화
			} else {
				setStatus('error')
				setMessage(response.message || '친구 요청에 실패했어요.')
			}
		} catch (err) {
			setStatus('error')
			setMessage('알 수 없는 오류가 발생했어요.')
		}
	}

	return (
		<div className="flex flex-col gap-4 p-6">
			<div>
				<h2 className="text-xl font-bold">친구 추가하기</h2>
				<p className="text-sm text-gray-500 mt-1">
					태그명을 사용하여 친구를 추가할 수 있어요.
				</p>
			</div>

			<div className="flex flex-row gap-2 items-center">
				<input
					type="text"
					placeholder="태그명을 입력하세요 (예: admin)"
					value={tag}
					onChange={(e) => setTag(e.target.value)}
					className="border p-2 rounded grow"
				/>
				<button
					onClick={handleSubmit}
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					친구 요청 보내기
				</button>
			</div>

			{message && (
				<p
					className={`text-sm ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}
				>
					{message}
				</p>
			)}
		</div>
	)
}

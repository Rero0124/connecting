'use client'

import { ErrorResponse, ProfileDetail, SuccessResponse } from '@/src/types/api'
import { useEffect, useRef, useState } from 'react'

export default function FriendAddPage() {
	const [tag, setTag] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [status, setStatus] = useState<'success' | 'error' | null>(null)
	const [loading, setLoading] = useState(false)
	const [profile, setProfile] = useState<ProfileDetail | null>(null)
	const [profileLoading, setProfileLoading] = useState(false)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleSubmit = async () => {
		if (!tag.trim() || loading) return
		setLoading(true)

		try {
			const response: SuccessResponse | ErrorResponse = await fetch(
				'/api/friend-requests',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ tag }),
				}
			).then((res) => res.json())

			if (response.status === 'success') {
				setStatus('success')
				setMessage('친구 요청을 보냈어요.')
				setTag('')
				setProfile(null)
			} else {
				setStatus('error')
				setMessage(response.message || '친구 요청에 실패했어요.')
			}
		} catch {
			setStatus('error')
			setMessage('알 수 없는 오류가 발생했어요.')
		} finally {
			setLoading(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmit()
		}
	}

	const fetchProfile = async (tag: string) => {
		if (!tag.trim() || tag.length < 2) {
			setProfile(null)
			setMessage(null)
			setStatus(null)
			return
		}
		setProfileLoading(true)
		try {
			const res = await fetch(`/api/profiles/${encodeURIComponent(tag)}`)
			if (res.status === 404) {
				setProfile(null)
				setMessage('해당 사용자를 찾을 수 없습니다.')
				setStatus('error')
				return
			}
			const response: SuccessResponse<ProfileDetail> = await res.json()
			if (response.status === 'success') {
				setProfile(response.data)
				setMessage(null)
				setStatus(null)
			} else {
				setProfile(null)
				setMessage('사용자 정보를 불러오지 못했습니다.')
				setStatus('error')
			}
		} catch {
			setProfile(null)
			setMessage('서버 오류로 정보를 불러올 수 없습니다.')
			setStatus('error')
		} finally {
			setProfileLoading(false)
		}
	}

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchProfile(tag)
		}, 500)

		return () => clearTimeout(delayDebounce)
	}, [tag])

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				setMessage(null)
				setStatus(null)
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [message])

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
					ref={inputRef}
					type="text"
					placeholder="태그명을 입력하세요 (예: admin)"
					value={tag}
					onChange={(e) => setTag(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
					className="border p-2 rounded grow"
				/>
				<button
					onClick={handleSubmit}
					disabled={loading}
					className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
				>
					{loading ? '보내는 중...' : '친구 요청 보내기'}
				</button>
			</div>

			{message && (
				<p
					className={`text-sm ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}
				>
					{message}
				</p>
			)}

			{profileLoading && (
				<p className="text-sm text-gray-400">프로필 불러오는 중...</p>
			)}
			{!profileLoading && profile && (
				<div className="border rounded p-4 mt-2 bg-white">
					<div className="flex gap-4 items-center">
						<img
							src={profile.image ?? '/default-profile.png'}
							alt="프로필 이미지"
							className="w-12 h-12 rounded-full object-cover"
						/>
						<div>
							<p className="font-semibold text-lg">
								{profile.name} ({profile.tag})
							</p>
							<p className="text-sm text-gray-600">
								{profile.statusType} -{' '}
								{profile.information ?? '상태 메시지 없음'}
							</p>
							<p className="text-xs text-gray-500">
								{profile.isOnline ? '온라인' : '오프라인'}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

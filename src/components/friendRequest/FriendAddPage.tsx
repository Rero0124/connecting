'use client'

import { CreateFriendRequestBodySchema } from '@/src/lib/schemas/friend.schema'
import {
	GetProfileResponseSchema,
	Profile,
} from '@/src/lib/schemas/profile.schema'
import { fetchWithValidation } from '@/src/lib/util'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export default function FriendAddPage() {
	const [tag, setTag] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [status, setStatus] = useState<'success' | 'error' | null>(null)
	const [loading, setLoading] = useState(false)
	const [profile, setProfile] = useState<Profile | null>(null)
	const [profileLoading, setProfileLoading] = useState(false)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleSubmit = async () => {
		if (!tag.trim() || loading) return
		setLoading(true)

		try {
			const response = await fetchWithValidation('/api/friend-requests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: { tag },
				bodySchema: CreateFriendRequestBodySchema,
			})

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
			const response = await fetchWithValidation(
				`/api/profiles/${encodeURIComponent(tag)}`,
				{
					dataSchema: GetProfileResponseSchema,
				}
			)
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
		<div className="flex flex-col gap-5 p-6">
			<div>
				<h2 className="text-lg font-bold text-foreground">친구 추가하기</h2>
				<p className="text-sm text-foreground-muted mt-1">
					태그명을 사용하여 친구를 추가할 수 있어요.
				</p>
			</div>

			<div className="flex gap-2 items-center">
				<div className="relative flex-1">
					<svg
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.3-4.3" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						placeholder="태그명을 입력하세요 (예: admin)"
						value={tag}
						onChange={(e) => setTag(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={loading}
						className="w-full h-11 pl-9 pr-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
					/>
				</div>
				<button
					onClick={handleSubmit}
					disabled={loading || !tag.trim()}
					className="h-11 px-5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
				>
					{loading ? '보내는 중...' : '요청 보내기'}
				</button>
			</div>

			{message && (
				<p
					className={`text-sm ${status === 'success' ? 'text-success' : 'text-danger'}`}
				>
					{message}
				</p>
			)}

			{profileLoading && (
				<div className="flex items-center gap-2 text-sm text-foreground-dim">
					<div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
					프로필 불러오는 중...
				</div>
			)}
			{!profileLoading && profile && (
				<div className="flex items-center gap-4 p-4 bg-background-light border border-border rounded-xl">
					<Image
						src={profile.image ?? '/default-profile.png'}
						alt="프로필 이미지"
						width={48}
						height={48}
						className="w-12 h-12 rounded-full object-cover"
					/>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-foreground">
							{profile.name}{' '}
							<span className="text-foreground-muted font-normal">
								({profile.tag})
							</span>
						</p>
						<p className="text-xs text-foreground-dim mt-0.5">
							{profile.information || '상태 메시지 없음'}
						</p>
						<div className="flex items-center gap-1.5 mt-1">
							<span
								className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-online' : 'bg-offline'}`}
							/>
							<span className="text-xs text-foreground-dim">
								{profile.isOnline ? '온라인' : '오프라인'}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

'use client'

import { useState } from 'react'

interface JoinRoomModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
	const [inviteCode, setInviteCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [status, setStatus] = useState<'success' | 'error' | null>(null)

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!inviteCode.trim() || loading) return

		// 초대 코드 형식: "roomId:code"
		const parts = inviteCode.trim().split(':')
		if (parts.length !== 2) {
			setStatus('error')
			setMessage('초대 코드 형식이 올바르지 않습니다. (형식: 방ID:코드)')
			return
		}

		const [roomId, code] = parts
		setLoading(true)
		setMessage(null)

		try {
			const res = await fetch(`/api/rooms/${roomId}/participants`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ joinCode: code }),
			})

			const data = await res.json()

			if (res.ok) {
				setStatus('success')
				setMessage(data.message || '방에 참여했습니다!')
				setTimeout(() => {
					setInviteCode('')
					setMessage(null)
					setStatus(null)
					onClose()
				}, 1000)
			} else {
				setStatus('error')
				setMessage(data.message || '방 참여에 실패했습니다.')
			}
		} catch {
			setStatus('error')
			setMessage('서버 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleClose = () => {
		setInviteCode('')
		setMessage(null)
		setStatus(null)
		onClose()
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={handleClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[90vw] max-w-100"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 pt-6 pb-4">
					<h2 className="text-lg font-bold text-foreground">방 탐색</h2>
					<button
						onClick={handleClose}
						className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-6 pb-6">
					<p className="text-sm text-foreground-muted mb-4">
						초대 코드를 입력하여 방에 참여할 수 있습니다.
					</p>

					<div className="mb-4">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							초대 코드
						</label>
						<input
							type="text"
							className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							value={inviteCode}
							onChange={(e) => setInviteCode(e.target.value)}
							placeholder="방ID:초대코드"
							required
							autoFocus
						/>
					</div>

					{message && (
						<p
							className={`text-sm mb-4 ${status === 'success' ? 'text-success' : 'text-danger'}`}
						>
							{message}
						</p>
					)}

					<div className="flex gap-2">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
						>
							취소
						</button>
						<button
							type="submit"
							className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
							disabled={!inviteCode.trim() || loading}
						>
							{loading ? '참여 중...' : '참여하기'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

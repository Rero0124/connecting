'use client'

import { fetchWithValidation } from '@/src/lib/util'
import { CreateRoomChannelBodySchema } from '@/src/lib/schemas/room.schema'
import { useState } from 'react'

interface CreateChannelModalProps {
	isOpen: boolean
	onClose: () => void
	roomId: string
}

export default function CreateChannelModal({
	isOpen,
	onClose,
	roomId,
}: CreateChannelModalProps) {
	const [name, setName] = useState('')
	const [channelType, setChannelType] = useState<'text' | 'voice'>('text')
	const [loading, setLoading] = useState(false)

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || loading) return
		setLoading(true)

		try {
			const response = await fetchWithValidation(
				`/api/rooms/${roomId}/channels`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: {
						name: name.trim(),
						type: channelType,
					},
					bodySchema: CreateRoomChannelBodySchema,
				}
			)

			if (response.status === 'success') {
				setName('')
				setChannelType('text')
				onClose()
			} else {
				alert(response.message || '채널 생성에 실패했습니다.')
			}
		} catch {
			alert('채널 생성 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[90vw] max-w-100"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 pt-6 pb-4">
					<h2 className="text-lg font-bold text-foreground">채널 추가</h2>
					<button
						onClick={onClose}
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
					<div className="mb-4">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							채널 유형
						</label>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setChannelType('text')}
								className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
									channelType === 'text'
										? 'border-accent bg-accent/10 text-accent'
										: 'border-border text-foreground-muted hover:text-foreground hover:bg-background-light'
								}`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={1.8}
								>
									<path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
								</svg>
								텍스트
							</button>
							<button
								type="button"
								onClick={() => setChannelType('voice')}
								className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
									channelType === 'voice'
										? 'border-accent bg-accent/10 text-accent'
										: 'border-border text-foreground-muted hover:text-foreground hover:bg-background-light'
								}`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={1.8}
								>
									<path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
								</svg>
								음성
							</button>
						</div>
					</div>

					<div className="mb-6">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							채널 이름
						</label>
						<input
							type="text"
							className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="채널 이름을 입력하세요"
							required
							autoFocus
						/>
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
						>
							취소
						</button>
						<button
							type="submit"
							className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
							disabled={!name.trim() || loading}
						>
							{loading ? '생성 중...' : '만들기'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

'use client'

import { fetchWithValidation } from '@/src/lib/util'
import { CreateRoomBodySchema } from '@/src/lib/schemas/room.schema'
import { useState } from 'react'

interface CreateRoomModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function CreateRoomModal({
	isOpen,
	onClose,
}: CreateRoomModalProps) {
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || loading) return
		setLoading(true)

		try {
			const response = await fetchWithValidation('/api/rooms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: {
					name: name.trim(),
					iconType: 'text',
					iconData: name.trim(),
				},
				bodySchema: CreateRoomBodySchema,
			})

			if (response.status === 'success') {
				setName('')
				onClose()
			} else {
				alert(response.message || '방 생성에 실패했습니다.')
			}
		} catch {
			alert('방 생성 중 오류가 발생했습니다.')
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
					<h2 className="text-lg font-bold text-foreground">방 만들기</h2>
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
					<div className="mb-6">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							방 이름
						</label>
						<input
							type="text"
							className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="방 이름을 입력하세요"
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

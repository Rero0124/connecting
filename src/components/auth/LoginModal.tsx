'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { login } from '@/app/actions/auth'
import LoginProfileSelect from './LoginProfileSelect'

interface Props {
	open: boolean
	onClose: () => void
}

export default function LoginModal({ open, onClose }: Props) {
	const [state, action, pending] = useActionState(login, undefined)
	const formRef = useRef<HTMLFormElement>(null)
	const profileIdRef = useRef<HTMLInputElement>(null)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [selectProfileMode, setSelectProfileMode] = useState(false)

	useEffect(() => {
		if (state?.isLogin) {
			location.reload()
		}

		// 프로필 선택 모드로 진입
		if (state?.profiles) {
			setSelectProfileMode(true)
		}
	}, [state])

	useEffect(() => {
		// 모달이 닫힐 때 모든 상태 초기화
		if (!open) {
			setEmail('')
			setPassword('')
			setSelectProfileMode(false)
		}
	}, [open])

	const selectProfile = (profileId: bigint) => {
		if (formRef.current && profileIdRef.current) {
			profileIdRef.current.value = profileId.toString()
			formRef.current.requestSubmit()
		}
	}

	const cancelProfileSelect = () => {
		setSelectProfileMode(false)
		setEmail('')
		setPassword('')
	}

	if (!open) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[420px]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-6 pb-2">
					<h2 className="text-lg font-bold text-foreground">
						{selectProfileMode ? '프로필 선택' : '다른 계정으로 로그인'}
					</h2>
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

				<div className="px-6 pb-6">
					{selectProfileMode && (
						<LoginProfileSelect
							profiles={state?.profiles || []}
							onSelect={selectProfile}
							onCancel={cancelProfileSelect}
						/>
					)}
					<form
						ref={formRef}
						action={action}
						className={`flex flex-col gap-4 ${selectProfileMode ? 'hidden' : ''}`}
					>
						<input ref={profileIdRef} name="profileId" type="hidden" />

						<div>
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								이메일
							</label>
							<input
								type="email"
								name="email"
								placeholder="이메일을 입력하세요"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								비밀번호
							</label>
							<input
								type="password"
								name="password"
								placeholder="비밀번호를 입력하세요"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							/>
						</div>

						{state?.message && (
							<p className="text-sm text-danger">{state.message}</p>
						)}

						<button
							type="submit"
							className="h-11 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
							disabled={pending}
						>
							{pending ? '로그인 중...' : '로그인'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

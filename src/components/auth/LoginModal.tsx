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

	const selectProfile = (profileId: number) => {
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
			<div className="relative bg-background p-8 rounded-lg w-[500px] border border-gray-700">
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
				>
					×
				</button>

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
					<h2 className="text-2xl font-bold text-center mb-4">
						다른 계정으로 로그인
					</h2>
					<input
						type="email"
						name="email"
						placeholder="이메일"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="p-2 border rounded"
					/>
					<input
						type="password"
						name="password"
						placeholder="비밀번호"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-2 border rounded"
					/>
					{state?.message && (
						<p className="text-sm text-red-500">{state.message}</p>
					)}
					<button
						type="submit"
						className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
						disabled={pending}
					>
						로그인
					</button>
				</form>
			</div>
		</div>
	)
}

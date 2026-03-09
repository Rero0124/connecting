'use client'

import { join } from '@/app/actions/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

export const JoinForm = () => {
	const [state, action, pending] = useActionState(join, undefined)
	const [tagUsed, setTagUsed] = useState<boolean>(false)
	const [tagFetching, setTagFetching] = useState<boolean>(false)
	const [initTagFetch, setInitTagFetch] = useState<boolean>(false)

	const tagRef = useRef<HTMLInputElement>(null)

	const tagCheck = () => {
		if (!initTagFetch) {
			setInitTagFetch(true)
		}
		setTagFetching(true)
		if (tagRef.current && tagRef.current.value !== '') {
			fetch(`/api/profiles/${tagRef.current.value}`, {
				cache: 'no-cache',
			}).then((res) => {
				setTagUsed(res.status !== 404)
				setTagFetching(false)
			})
		} else {
			setTagUsed(true)
			setTagFetching(false)
		}
	}

	useEffect(() => {
		if (state?.isJoin) {
			redirect('/login')
		}
	}, [state])

	return (
		<form
			action={action}
			className="relative z-10 flex flex-col w-[420px] p-10 bg-background-secondary/80 backdrop-blur-xl border border-border-light rounded-2xl shadow-lg"
		>
			{/* Logo / Title */}
			<div className="mb-8 text-center">
				<div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/20 flex items-center justify-center">
					<svg
						className="w-7 h-7 text-accent"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.8}
					>
						<path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-foreground">회원가입</h1>
				<p className="mt-1 text-sm text-foreground-muted">
					새 계정을 만들어 시작하세요
				</p>
			</div>

			{/* Tag */}
			<div className="mb-4">
				<label
					htmlFor="tag"
					className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2"
				>
					태그
				</label>
				<input
					ref={tagRef}
					id="tag"
					className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
					name="tag"
					placeholder="고유한 태그를 입력하세요"
					defaultValue={state?.data?.tag}
					onChange={tagCheck}
				/>
				{initTagFetch && (
					<p
						className={`mt-1.5 text-xs ${tagUsed ? 'text-danger' : 'text-success'}`}
					>
						{tagUsed ? '이미 사용 중인 태그입니다' : '사용 가능한 태그입니다'}
					</p>
				)}
			</div>

			{/* Name */}
			<div className="mb-4">
				<label
					htmlFor="name"
					className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2"
				>
					이름
				</label>
				<input
					id="name"
					className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
					name="name"
					placeholder="표시될 이름을 입력하세요"
					defaultValue={state?.data?.name}
				/>
				{state?.errors?.name && (
					<p className="mt-1.5 text-xs text-danger">{state.errors.name}</p>
				)}
			</div>

			{/* Email */}
			<div className="mb-4">
				<label
					htmlFor="email"
					className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2"
				>
					이메일
				</label>
				<input
					id="email"
					className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
					name="email"
					placeholder="example@email.com"
					defaultValue={state?.data?.email}
				/>
				{state?.errors?.email && (
					<p className="mt-1.5 text-xs text-danger">{state.errors.email}</p>
				)}
			</div>

			{/* Password */}
			<div className="mb-4">
				<label
					htmlFor="password"
					className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2"
				>
					비밀번호
				</label>
				<input
					id="password"
					className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
					name="password"
					type="password"
					placeholder="비밀번호를 입력하세요"
					defaultValue={state?.data?.password}
				/>
				{state?.errors?.password && (
					<div className="mt-1.5 text-xs text-danger">
						<p className="font-medium mb-1">비밀번호 조건:</p>
						<ul className="space-y-0.5 pl-3">
							{state.errors.password.map((error) => (
								<li key={error}>• {error}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Submit */}
			<button
				className="w-full h-11 mt-4 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
				disabled={pending || tagFetching}
				type="submit"
			>
				{pending ? '가입 중...' : '가입하기'}
			</button>

			{/* Login link */}
			<p className="mt-6 text-center text-sm text-foreground-muted">
				이미 계정이 있으신가요?{' '}
				<Link
					href="/login"
					className="text-accent hover:text-accent-hover font-medium"
				>
					로그인
				</Link>
			</p>
		</form>
	)
}

export default JoinForm

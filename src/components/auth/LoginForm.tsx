'use client'

import { login } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

export const LoginForm = () => {
	const [state, action, pending] = useActionState(login, undefined)
	const [selectProfileModelOpen, setSelectProfileModelOpen] =
		useState<boolean>(false)

	const formRef = useRef<HTMLFormElement>(null)
	const profileIdRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (state?.isLogin) {
			redirect('/')
		}
		console.log(state?.profiles)
		if (state?.profiles) {
			setSelectProfileModelOpen(true)
		} else {
			setSelectProfileModelOpen(false)
		}
	}, [state])

	const cancelLogin = () => {
		setSelectProfileModelOpen(false)
	}

	const selectProfile = (profileId: bigint) => {
		if (formRef.current && profileIdRef.current) {
			profileIdRef.current.value = profileId.toString()
			formRef.current.requestSubmit()
		}
	}

	return (
		<>
			<form
				ref={formRef}
				action={action}
				className="relative z-10 flex flex-col w-[420px] p-10 bg-background-secondary/80 backdrop-blur-xl border border-border-light rounded-2xl shadow-lg"
			>
				<input ref={profileIdRef} name="profileId" type="hidden" />
				{selectProfileModelOpen && (
					<div className="absolute inset-0 z-10 rounded-2xl" />
				)}

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
							<path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 1 1 6.364 6.364l-1.757 1.757" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-foreground">로그인</h1>
					<p className="mt-1 text-sm text-foreground-muted">
						Connecting에 오신 것을 환영합니다
					</p>
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
				</div>

				{/* Errors */}
				{state?.errors?.email && (
					<p className="text-xs text-danger mb-2">{state.errors.email}</p>
				)}
				{state?.message && (
					<p className="text-xs text-danger mb-2">{state.message}</p>
				)}

				{/* Submit */}
				<button
					className="w-full h-11 mt-4 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
					disabled={pending}
					type="submit"
				>
					{pending ? '로그인 중...' : '로그인'}
				</button>

				{/* Join link */}
				<p className="mt-6 text-center text-sm text-foreground-muted">
					계정이 없으신가요?{' '}
					<Link
						className="text-accent hover:text-accent-hover font-medium"
						href="/join"
					>
						회원가입
					</Link>
				</p>
			</form>

			{/* Profile Selection Overlay */}
			{selectProfileModelOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
					<div className="relative z-10 w-[400px] p-8 bg-background-secondary border border-border-light rounded-2xl shadow-lg">
						<button
							className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light"
							onClick={cancelLogin}
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
						<h2 className="text-xl font-bold text-center mb-6">프로필 선택</h2>
						<div className="flex flex-col gap-2">
							{state && state.profiles
								? state.profiles.map((profile) => (
										<div
											key={`login_user_profile_${profile.id}`}
											className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-background-light hover:border-accent/30 cursor-pointer transition-colors"
											onClick={() => selectProfile(profile.id)}
										>
											<Image
												alt="사용자 이미지"
												src={profile.image}
												width={40}
												height={40}
												className="w-10 h-10 rounded-full object-cover"
											/>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-foreground truncate">
													{profile.name ? `${profile.name}` : profile.tag}
												</p>
												<p className="text-xs text-foreground-muted">
													{profile.isCompany ? '업무' : '개인'} · {profile.tag}
												</p>
											</div>
											<svg
												className="w-4 h-4 text-foreground-dim"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
											</svg>
										</div>
									))
								: null}
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default LoginForm

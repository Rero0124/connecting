'use client'
import { login } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

export default function Login() {
	const [state, action, pending] = useActionState(login, undefined)
	const [selectProfileModelOpen, setSelectProfileModelOpen] =
		useState<boolean>(false)

	const formRef = useRef<HTMLFormElement>(null)
	const profileIdRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (state?.isLogin) {
			redirect('/')
		}
		if (state?.profiles) {
			setSelectProfileModelOpen(true)
		} else {
			setSelectProfileModelOpen(false)
		}
	}, [state])

	const cancelLogin = () => {
		setSelectProfileModelOpen(false)
	}

	const selectProfile = (profileId: number) => {
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
				className="relative flex flex-col p-12 border-[1px] rounded-lg"
			>
				<input ref={profileIdRef} name="profileId" />
				{selectProfileModelOpen && (
					<div className="absolute top-0 left-0 w-full h-full"></div>
				)}
				<div className="mb-11 text-4xl text-center">
					<p>Login</p>
				</div>
				<div className="flex flex-row justify-between min-w-80 h-12 px-3 py-1 leading-10">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						className="p-2 border-[1px] rounded-lg"
						name="email"
						placeholder="Email"
						defaultValue={state?.data?.email}
					/>
				</div>
				<div className="flex flex-row justify-between min-w-80 h-12 px-3 py-1 leading-10">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						className="p-2 border-[1px] rounded-lg"
						name="password"
						type="password"
						placeholder="Password"
						defaultValue={state?.data?.password}
					/>
				</div>
				{state?.errors?.email && <p>{state.errors.email}</p>}
				{state?.message && <p>{state.message}</p>}
				<div className="flex flex-row justify-between px-3 pt-8">
					<Link className="cursor-pointer" href="/join">
						Join
					</Link>
					<button className="cursor-pointer" disabled={pending} type="submit">
						Login
					</button>
				</div>
			</form>
			{selectProfileModelOpen && (
				<>
					<div className="absolute flex flex-col justify-center items-center p-12 border-[1px] rounded-lg bg-background">
						<div
							className="absolute top-0 right-0 p-3 cursor-pointer"
							onClick={cancelLogin}
						>
							X
						</div>
						<div className="h-14 mb-4 text-4xl text-center">
							<p>Select Profile</p>
						</div>
						<div className="flex flex-col min-w-60">
							{state && state.profiles ? (
								state.profiles.map((profile) => {
									return (
										<div
											key={`login_user_profile_${profile.id}`}
											className="flex flex-row w-full h-10 p-2 mt-2 border-[1px] rounded"
											onClick={() => {
												selectProfile(profile.id)
											}}
										>
											<Image
												alt="사용자 이미지"
												className="mr-2"
												src={profile.image}
												width={0}
												height={0}
											/>
											<span className="mr-2">
												{profile.isCompany ? '업무' : '개인'} -{' '}
											</span>
											<span>
												{profile.name
													? `${profile.name}(${profile.tag})`
													: profile.tag}
											</span>
										</div>
									)
								})
							) : (
								<></>
							)}
						</div>
					</div>
				</>
			)}
		</>
	)
}

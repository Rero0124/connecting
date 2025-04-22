'use client'
import { join } from '@/app/actions/auth'
import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'

export default function Join() {
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
			fetch(`/api/auth/check/duplication/tag/${tagRef.current.value}`, {
				cache: 'no-cache',
			})
				.then((res) => res.json())
				.then((data) => {
					setTagUsed(data.isUsed)
					setTagFetching(false)
				})
		} else {
			setTagUsed(true)
			setTagFetching(false)
		}
	}

	return (
		<form
			action={action}
			className="flex flex-col p-12 border-[1px] rounded-lg"
		>
			<div className="mb-11 text-4xl text-center">
				<p>Join</p>
			</div>
			<div className="flex flex-row justify-between min-w-80 h-12 px-3 py-1 leading-10">
				<label htmlFor="tag">Tag</label>
				<input
					ref={tagRef}
					id="tag"
					className="p-2 border-[1px] rounded-lg"
					name="tag"
					placeholder="tag"
					defaultValue={state?.data?.tag}
					onKeyUp={tagCheck}
				/>
			</div>
			{initTagFetch &&
				(tagUsed ? (
					<p>사용 불가능한 태그입니다.</p>
				) : (
					<p>사용 가능한 태그입니다.</p>
				))}

			<div className="flex flex-row justify-between min-w-80 h-12 px-3 py-1 leading-10">
				<label htmlFor="name">Name</label>
				<input
					id="name"
					className="p-2 border-[1px] rounded-lg"
					name="name"
					placeholder="Name"
					defaultValue={state?.data?.name}
				/>
			</div>
			{state?.errors?.name && <p>{state.errors.name}</p>}

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
			{state?.errors?.email && <p>{state.errors.email}</p>}

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
			{state?.errors?.password && (
				<div>
					<p>Password must:</p>
					<ul>
						{state.errors.password.map((error) => (
							<li key={error}>- {error}</li>
						))}
					</ul>
				</div>
			)}
			<div className="flex flex-row justify-between px-3 pt-8">
				<Link href="/login">Login</Link>
				<button disabled={pending && tagFetching} type="submit">
					Join
				</button>
			</div>
		</form>
	)
}

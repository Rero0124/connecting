'use client'

import { useEffect, useState } from 'react'
import { setTitle } from '@/src/lib/features/saveData/saveDataSlice'
import { useAppDispatch } from '@/src/lib/hooks'

export default function Main() {
	const dispatch = useAppDispatch()

	useEffect(() => {
		dispatch(setTitle('room'))
	}, [])

	return (
		<div className="">
			<main className=""></main>
		</div>
	)
}

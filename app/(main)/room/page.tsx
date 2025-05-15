'use client'

import { useAppSelector } from '@/src/lib/hooks'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
	const roomState = useAppSelector((state) => state.room)
	useEffect(() => {
		if (roomState.rooms.length === 0) {
			redirect('/dm')
		} else {
			redirect(`/room/${roomState.rooms[0].id}`)
		}
	}, [roomState])
	return <></>
}

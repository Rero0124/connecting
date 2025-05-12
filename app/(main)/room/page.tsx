'use client'

import { useAppSelector } from '@/src/lib/hooks'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Main() {
	const roomData = useAppSelector((state) => state.roomDate)
	useEffect(() => {
		if (roomData.rooms.length === 0) {
			redirect('/message')
		} else {
			redirect(`/room/${roomData.rooms[0].id}`)
		}
	}, [roomData])
	return <></>
}

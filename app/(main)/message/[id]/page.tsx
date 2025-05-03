'use client'

import { addDmDetail } from '@/src/lib/features/dmData/dmDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { socket } from '@/src/lib/socket'
import {
	DmSessionDetail,
	ErrorResponse,
	SuccessResponse,
} from '@/src/types/api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Main() {
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const dmData = useAppSelector((state) => state.dmData)
	const dispatch = useAppDispatch()

	const { id } = useParams<{ id: string }>()

	const submitMessage = () => {
		socket.emit('send_dmMessage', id, pendingMessage)
		setPendingMessage('')
	}

	useEffect(() => {
		if (!dmData.dmDetails[id]) {
			fetch(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions/${id}`, {
				cache: 'no-store',
			})
				.then((res) => res.json())
				.then((data: SuccessResponse<DmSessionDetail> | ErrorResponse) => {
					if (data.status === 'success') {
						dispatch(addDmDetail(data.data))
					}
				})
		}
	}, [dmData])

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="">title</div>
			<div>content</div>
			<div className="">
				<input
					value={pendingMessage}
					onChange={(e) => {
						setPendingMessage(e.currentTarget.value)
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') submitMessage()
					}}
				/>
			</div>
		</div>
	)
}

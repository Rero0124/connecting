'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/src/lib/store'
import { redirect } from 'next/navigation'

export default function Main() {
	const { selectedFriendMenu } = useSelector(
		(state: RootState) => state.viewContext
	)

	switch (selectedFriendMenu) {
		case 'list':
			redirect('/friend/list')
		case 'request':
			redirect('/friend/request')
		case 'manage':
			redirect('/friend/manage')
		default:
			redirect('/friend/list')
	}
}

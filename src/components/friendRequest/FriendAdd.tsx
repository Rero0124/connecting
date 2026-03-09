'use client'
import { use, useEffect, useState } from 'react'
import FriendAddPage from '@/src/components/friendRequest/FriendAddPage'
import FriendSendPage from './FriendSendPage'
import FriendReceivePage from '@/src/components/friendRequest/FriendReceivePage'
import { useAppDispatch } from '@/src/lib/hooks'
import { setSelectedFriendMenu } from '@/src/lib/features/viewContext/viewContextSlice'

export default function FriendAdd() {
	const [selectedMenu, setSelectedMenu] = useState<string>('send')
	const dispatch = useAppDispatch()

	function Tab({
		children,
		name,
	}: {
		children: React.ReactNode
		name: string
	}) {
		const isActive = selectedMenu === name
		return (
			<button
				className={`h-8 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
					isActive
						? 'bg-accent/15 text-accent'
						: 'text-foreground-muted hover:bg-background-light hover:text-foreground'
				}`}
				onClick={() => setSelectedMenu(name)}
			>
				{children}
			</button>
		)
	}

	useEffect(() => {
		dispatch(setSelectedFriendMenu('request'))
	}, [])

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex items-center gap-1 h-12 px-4 border-b border-border shrink-0">
				<Tab name="send">받은 신청</Tab>
				<Tab name="recive">보낸 신청</Tab>
				<Tab name="add">친구 추가</Tab>
			</div>

			<div className="flex flex-col grow overflow-hidden">
				{selectedMenu === 'send' && <FriendReceivePage />}
				{selectedMenu === 'recive' && <FriendSendPage />}
				{selectedMenu === 'add' && <FriendAddPage />}
			</div>
		</div>
	)
}

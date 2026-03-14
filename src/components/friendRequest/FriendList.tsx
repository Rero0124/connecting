'use client'

import {
	setSelectedFriendMenu,
	setSelectedFriendSubMenu,
} from '@/src/lib/features/viewContext/viewContextSlice'
import { useAppDispatch } from '@/src/lib/hooks'
import { RootState } from '@/src/lib/store'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useContextMenu } from '@/src/provider/ContextMenuProvider'

type FriendStatus = 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'

const getStatusColor = (isOnline: boolean): string => {
	return isOnline ? 'bg-online' : 'bg-offline'
}

export default function FriendList() {
	const { friends } = useSelector((state: RootState) => state.friend)
	const { selectedFriendSubMenu } = useSelector(
		(state: RootState) => state.viewContext
	)
	const dispatch = useAppDispatch()
	const router = useRouter()
	const contextMenu = useContextMenu()

	const startDm = async (friendTag: string, friendName: string | null) => {
		try {
			const res = await fetch('/api/dm-sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: friendName ?? friendTag,
					iconType: 'text',
					iconData: friendName ?? friendTag,
					participants: [],
					tag: friendTag,
				}),
			})
			if (res.ok) {
				router.push('/dm')
			}
		} catch {
			router.push('/dm')
		}
	}

	useEffect(() => {
		dispatch(setSelectedFriendMenu('list'))
		if (!['all', 'online', 'favorite'].includes(selectedFriendSubMenu ?? '')) {
			dispatch(setSelectedFriendSubMenu('all'))
		}
	}, [])

	function Menu({
		children,
		name,
		classname = '',
	}: {
		children: React.ReactNode
		name: string
		classname?: string
	}) {
		const onClick = () => dispatch(setSelectedFriendSubMenu(name))

		return (
			<div
				className={`cursor-pointer h-8 px-3 rounded-md text-center text-xs font-medium leading-8 transition-colors ${
					selectedFriendSubMenu === name
						? 'bg-accent/15 text-accent'
						: 'text-foreground-muted hover:bg-background-light hover:text-foreground'
				} ${classname}`}
				onClick={onClick}
			>
				{children}
			</div>
		)
	}

	const filteredFriends = friends.filter((friend) => {
		if (selectedFriendSubMenu === 'online') return friend.isOnline
		return true
	})

	return (
		<div className="flex flex-col h-full bg-background">
			{/* 메뉴바 */}
			<div className="flex items-center gap-1 h-12 px-4 border-b border-border shrink-0">
				<Menu name="all">모두</Menu>
				<Menu name="online">온라인</Menu>
				<Menu name="favorite">친한친구</Menu>
			</div>

			{/* 친구 수 */}
			<div className="px-5 pt-4 pb-2">
				<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
					{selectedFriendSubMenu === 'all'
						? '모든 친구'
						: selectedFriendSubMenu === 'online'
							? '온라인'
							: '친한친구'}{' '}
					— {filteredFriends.length}명
				</span>
			</div>

			{/* 친구 목록 */}
			<div className="flex flex-col grow overflow-y-auto px-3 gap-0.5">
				{filteredFriends.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-foreground-dim">
						<svg
							className="w-12 h-12 mb-3 opacity-30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1}
						>
							<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
						</svg>
						<p className="text-sm">표시할 친구가 없습니다</p>
					</div>
				) : (
					filteredFriends.map((friend) => (
						<div
							key={`key_friend_${friend.tag}`}
							className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light cursor-pointer transition-colors group"
							onContextMenu={(e) =>
								contextMenu.open(e, [
									{
										label: '메시지 보내기',
										onClick: () => startDm(friend.tag, friend.name),
									},
									{
										label: '프로필 보기',
										onClick: () => router.push(`/user/${friend.tag}`),
									},
									{ separator: true },
									{
										label: '친구 삭제',
										danger: true,
										onClick: () => {
											if (confirm(`${friend.name ?? friend.tag}님을 친구에서 삭제하시겠습니까?`)) {
												fetch(`/api/friends/${friend.tag}`, { method: 'DELETE' })
											}
										},
									},
								])
							}
						>
							<div className="relative w-9 h-9 shrink-0">
								<Image
									src={friend.image || '/default-profile.png'}
									alt="profile"
									fill
									className="rounded-full object-cover"
								/>
								<span
									className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${getStatusColor(
										friend.isOnline
									)}`}
								/>
							</div>
							<div className="flex flex-col flex-1 min-w-0">
								<span className="text-sm font-medium text-foreground truncate">
									{friend.name ?? friend.tag}
								</span>
								<span className="text-xs text-foreground-dim truncate">
									{friend.information || ''}
								</span>
							</div>
							{/* 호버 시 액션 버튼 */}
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={(e) => {
										e.stopPropagation()
										startDm(friend.tag, friend.name)
									}}
									className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.8}
									>
										<path d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
									</svg>
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

'use client'

import { RootState } from '@/src/lib/store'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/src/lib/hooks'
import { setSelectedFriendMenu } from '@/src/lib/features/viewContext/viewContextSlice'

type FriendStatus = 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'

interface Friend {
	tag: string
	name?: string | null
	image?: string
	statusType: string
	information?: string
	isOnline: boolean
}

const getStatusLabel = (isOnline: boolean): string => {
	return isOnline ? '온라인' : '오프라인'
}

const getStatusColor = (isOnline: boolean): string => {
	return isOnline ? 'bg-online' : 'bg-offline'
}

const order: Record<FriendStatus, number> = {
	ONLINE: 0,
	AWAY: 1,
	DO_NOT_DISTURB: 2,
	OFFLINE: 3,
}

export default function FriendManage() {
	const friendsData = useSelector((state: RootState) => state.friend)
	const dispatch = useAppDispatch()

	const sortedFriends = [...friendsData.friends].sort(
		(a: Friend, b: Friend) =>
			order[a.statusType as FriendStatus] - order[b.statusType as FriendStatus]
	)

	const [activeFriendTag, setActiveFriendTag] = useState<string | null>(null)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const router = useRouter()

	// 외부 클릭 시 더보기 메뉴 닫기
	useEffect(() => {
		dispatch(setSelectedFriendMenu('manage'))
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setActiveFriendTag(null)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleDeleteFriend = (tag: string) => {
		if (confirm(`${tag}님을 친구 목록에서 삭제하시겠습니까?`)) {
			fetch(`/api/friends/${tag}`, {
				method: 'DELETE',
			}).then(() => {
				alert('삭제되었습니다.')
			})
		}
	}

	return (
		<div className="flex flex-col h-full bg-background">
			{/* 헤더 */}
			<div className="flex items-center h-12 px-5 border-b border-border shrink-0">
				<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
					친구 관리 — {sortedFriends.length}명
				</span>
			</div>

			<div className="flex flex-col grow overflow-y-auto px-3 pt-2 gap-0.5">
				{sortedFriends.map((friend: Friend) => (
					<div
						key={`key_friend_${friend.tag}`}
						className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-background-light transition-colors group"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div className="relative w-9 h-9 shrink-0">
								<Image
									src={friend.image || '/default-profile.png'}
									alt="프로필"
									fill
									className="rounded-full object-cover"
								/>
								<span
									className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${getStatusColor(
										!!friend.isOnline
									)}`}
								/>
							</div>
							<div className="flex flex-col min-w-0">
								<span className="text-sm font-medium text-foreground truncate">
									{friend.name ?? friend.tag}
								</span>
								<span className="text-xs text-foreground-dim truncate">
									{getStatusLabel(!!friend.isOnline)}
									{friend.information ? ` · ${friend.information}` : ''}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
							<button
								title="메시지"
								className="h-8 px-3 text-xs font-medium rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light border border-border transition-colors"
								onClick={() => router.push(`/dm/${friend.tag}`)}
							>
								메시지
							</button>

							<div className="relative">
								<button
									title="더 보기"
									className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
									onClick={() =>
										setActiveFriendTag((prev) =>
											prev === friend.tag ? null : friend.tag
										)
									}
								>
									<svg
										className="w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
									</svg>
								</button>

								{activeFriendTag === friend.tag && (
									<div
										ref={menuRef}
										className="absolute right-0 mt-1 bg-background-secondary border border-border-light rounded-xl shadow-lg z-10 overflow-hidden w-40"
									>
										<button
											className="w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 text-left transition-colors"
											onClick={() => handleDeleteFriend(friend.tag)}
										>
											친구 삭제
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

'use client'

import { Profile } from '@/src/lib/schemas/profile.schema'
import Image from 'next/image'

interface Props {
	open: boolean
	profiles?: Profile[]
	onClose: () => void
	onSelect: (profileId: bigint) => void
	onLoginAnotherAccount?: () => void
}

export default function ChangeProfileModal({
	open,
	profiles,
	onClose,
	onSelect,
	onLoginAnotherAccount,
}: Props) {
	if (!open) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[400px]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-6 pb-2">
					<h2 className="text-lg font-bold text-foreground">프로필 선택</h2>
					<button
						onClick={onClose}
						className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Profile List */}
				<div className="px-4 pb-4 flex flex-col gap-1">
					{profiles && profiles.length > 0 ? (
						profiles.map((profile) => (
							<div
								key={profile.id}
								className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background-light cursor-pointer transition-colors"
								onClick={() => onSelect(profile.id)}
							>
								<Image
									src={profile.image}
									alt="프로필 이미지"
									width={40}
									height={40}
									className="w-10 h-10 rounded-full object-cover shrink-0"
								/>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground truncate">
										{profile.name ?? profile.tag}
									</p>
									<p className="text-xs text-foreground-dim truncate">
										{profile.tag}
									</p>
								</div>
							</div>
						))
					) : (
						<p className="py-6 text-sm text-foreground-dim text-center">
							사용 가능한 프로필이 없습니다.
						</p>
					)}
				</div>

				{/* Login Another Account */}
				{onLoginAnotherAccount && (
					<div className="px-4 pb-5">
						<button
							onClick={onLoginAnotherAccount}
							className="w-full h-10 rounded-xl border border-border text-sm text-foreground-muted hover:text-accent hover:border-accent/30 transition-colors"
						>
							다른 계정으로 로그인
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

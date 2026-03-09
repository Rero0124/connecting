import Image from 'next/image'

export default function LoginProfileSelect({
	profiles,
	onSelect,
	onCancel,
}: {
	profiles: any[]
	onSelect: (profileId: bigint) => void
	onCancel: () => void
}) {
	return (
		<div className="flex flex-col gap-3">
			<p className="text-sm text-foreground-muted mb-1">
				사용할 프로필을 선택하세요
			</p>
			<div className="flex flex-col gap-1">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background-light cursor-pointer transition-colors"
						onClick={() => onSelect(profile.id)}
					>
						<Image
							alt="프로필 아이콘"
							src={profile.image}
							width={36}
							height={36}
							className="w-9 h-9 rounded-full object-cover shrink-0"
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
				))}
			</div>
			<button
				onClick={onCancel}
				className="mt-1 h-10 rounded-xl border border-border text-sm text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
			>
				돌아가기
			</button>
		</div>
	)
}

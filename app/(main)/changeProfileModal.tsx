'use client'

import { ProfileList } from '@/src/types/api'
import Image from 'next/image'

interface Props {
	open: boolean
	profiles?: ProfileList
	onClose: () => void
	onSelect: (profileId: number) => void
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
			<div className="relative bg-background p-8 rounded-lg w-[500px] border border-gray-700">
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
				>
					×
				</button>
				<h2 className="text-2xl font-bold text-center mb-6">프로필 선택</h2>
				<div className="flex flex-col gap-3">
					{profiles && profiles.length > 0 ? (
						profiles.map((profile) => (
							<div
								key={profile.id}
								className="flex items-center p-3 border border-gray-600 rounded hover:bg-gray-800 cursor-pointer"
								onClick={() => onSelect(profile.id)}
							>
								<Image
									src={profile.image}
									alt="프로필 이미지"
									width={0}
									height={0}
									className="w-10 h-10 rounded-full mr-3 object-cover"
								/>
								<div className="text-sm">
									<div>{profile.name ?? profile.tag}</div>
									<div className="text-gray-400 text-xs">{profile.tag}</div>
								</div>
							</div>
						))
					) : (
						<p className="text-gray-400 text-center">
							사용 가능한 프로필이 없습니다.
						</p>
					)}
				</div>
				{onLoginAnotherAccount && (
					<button
						onClick={onLoginAnotherAccount}
						className="mt-6 text-sm text-blue-400 underline hover:text-blue-300 w-full text-center"
					>
						다른 계정으로 로그인
					</button>
				)}
			</div>
		</div>
	)
}

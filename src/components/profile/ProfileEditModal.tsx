'use client'

import { getSession } from '@/src/lib/clientUtil'
import { UpdateProfileByUserBodySchema } from '@/src/lib/schemas/profile.schema'
import { fetchWithValidation } from '@/src/lib/util'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
	open: boolean
	onClose: () => void
	initialData: {
		userTag: string
		userName?: string
		statusName?: string
		information?: string
		image: string
	}
}

export default function ProfileEditModal({
	open,
	onClose,
	initialData,
}: Props) {
	const [userName, setUserName] = useState(initialData.userName ?? '')
	const [statusName, setStatusName] = useState(initialData.statusName ?? '')
	const [information, setInformation] = useState(initialData.information ?? '')
	const [imagePreview, setImagePreview] = useState(initialData.image)
	const [imageEncoded, setImageEncoded] = useState<string | null>(null)

	if (!open) return null

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			const result = reader.result as string
			if (result?.startsWith('data:image')) {
				setImagePreview(result)
				setImageEncoded(result) // 전체 data:image/... 문자열 저장
			} else {
				setImagePreview('')
				setImageEncoded(null)
			}
		}
		reader.onerror = () => {
			setImagePreview('')
			setImageEncoded(null)
		}
		reader.readAsDataURL(file)
	}

	const handleSave = async () => {
		try {
			const session = await getSession()

			if (session.isAuth) {
				const profileResponse = await fetchWithValidation(
					`/api/users/${session.userId}/profiles/${session.profileId}`,
					{
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
						},
						body: {
							name: userName || undefined,
							information: information || undefined,
							image: imageEncoded || undefined,
						},
						bodySchema: UpdateProfileByUserBodySchema,
					}
				)

				if (profileResponse.status === 'success') {
					onClose()
				} else {
					alert('프로필 업데이트에 실패했습니다.')
				}
			} else {
				alert('프로필 업데이트에 실패했습니다.')
			}
		} catch (err) {
			console.error('프로필 저장 오류:', err)
			alert('저장 중 오류가 발생했습니다.')
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative w-[90vw] max-w-130 bg-background-secondary border border-border-light rounded-2xl overflow-hidden shadow-lg"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Banner */}
				<div className="h-28 bg-gradient-to-r from-accent/60 to-accent/30 relative">
					<button
						onClick={onClose}
						className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors"
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

					{/* Profile Image */}
					<div className="absolute left-6 -bottom-10">
						<label className="cursor-pointer relative group">
							<input
								type="file"
								className="hidden"
								onChange={handleImageChange}
							/>
							<div className="w-20 h-20 rounded-2xl border-4 border-background-secondary overflow-hidden bg-background-light">
								{imagePreview ? (
									<Image
										src={imagePreview}
										alt="프로필"
										width={80}
										height={80}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-foreground-dim text-xs">
										No Image
									</div>
								)}
							</div>
							<div className="absolute inset-0 rounded-2xl border-4 border-transparent bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
								<svg
									className="w-5 h-5 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={1.5}
								>
									<path d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
									<path d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
								</svg>
							</div>
						</label>
					</div>
				</div>

				{/* Content */}
				<div className="pt-14 px-6 pb-6">
					{/* Name & Tag */}
					<div className="mb-6">
						<h2 className="text-lg font-bold text-foreground">
							{userName || '프로필 이름'}
						</h2>
						<p className="text-xs text-foreground-dim">{initialData.userTag}</p>
					</div>

					{/* Form Fields */}
					<div className="space-y-4">
						<div>
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								별명
							</label>
							<input
								type="text"
								value={userName}
								onChange={(e) => setUserName(e.target.value)}
								className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
								placeholder="별명을 입력하세요"
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								상태 메시지
							</label>
							<input
								type="text"
								value={statusName}
								onChange={(e) => setStatusName(e.target.value)}
								className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
								placeholder="상태 메시지를 입력하세요"
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								한 줄 소개
							</label>
							<textarea
								value={information}
								onChange={(e) => setInformation(e.target.value)}
								className="w-full px-4 py-3 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim resize-none"
								rows={3}
								placeholder="소개글을 입력하세요"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2 mt-6">
						<button
							onClick={onClose}
							className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
						>
							취소
						</button>
						<button
							onClick={handleSave}
							className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
						>
							저장하기
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

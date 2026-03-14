'use client'
import { useAppSelector } from '@/src/lib/hooks'
import {
	GetProfilesResponseSchema,
	Profile,
} from '@/src/lib/schemas/profile.schema'
import { fetchWithValidation, toBigInt } from '@/src/lib/util'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface NewMessageModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function NewMessageModal({
	isOpen,
	onClose,
}: NewMessageModalProps) {
	const viewContextState = useAppSelector((state) => state.viewContext)

	const [title, setTitle] = useState('')
	const [imagePreview, setImagePreview] = useState(
		viewContextState.profile?.image ?? ''
	)
	const [imageEncoded, setImageEncoded] = useState<string | null>(null)
	const [recipients, setRecipients] = useState<
		{
			id: bigint
			label: string
		}[]
	>([])
	const [searchText, setSearchText] = useState<string>('')
	const [searchedUsers, setSearchedUsers] = useState<Profile[]>([])

	const handleRecipientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
			id: toBigInt(option.value),
			label: option.innerText,
		}))

		setRecipients(
			selectedOptions.filter(
				(selectedOption): selectedOption is { id: bigint; label: string } =>
					selectedOption.id !== null
			)
		)
	}

	const removeRecipient = (id: bigint) => {
		setRecipients((prev) => prev.filter((recipient) => recipient.id !== id))
	}

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		fetch(`/api/dm-sessions`, {
			method: 'POST',
			body: JSON.stringify({
				name: title,
				iconType: imageEncoded ? 'image' : 'text',
				iconData: imageEncoded ?? title,
				participants: recipients.map((recipient) => recipient.id.toString()),
			}),
		})
		onClose()
	}

	const handleSearchUserTag = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		e.preventDefault()
		setSearchText(e.currentTarget.value)
		if (e.currentTarget.value !== '') {
			const profilesResponse = await fetchWithValidation(
				`/api/profiles?tag=${e.currentTarget.value}`,
				{
					dataSchema: GetProfilesResponseSchema,
				}
			)
			if (profilesResponse.status === 'success') {
				setSearchedUsers(
					profilesResponse.data.filter(
						(profile) => profile.tag !== viewContextState.profile?.tag
					)
				)
			}
		}
	}

	useEffect(() => {
		if (!isOpen) {
			setTitle('')
			setImagePreview(viewContextState.profile?.image ?? '')
			setImageEncoded(null)
			setRecipients([])
			setSearchText('')
			setSearchedUsers([])
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-background-secondary border border-border-light rounded-2xl shadow-lg w-[90vw] max-w-110 max-h-[85vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-6 pb-4">
					<h2 className="text-lg font-bold text-foreground">새 DM 만들기</h2>
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

				<form onSubmit={handleSubmit} className="px-6 pb-6">
					{/* Image Upload */}
					<div className="mb-5 flex justify-center">
						<label className="relative cursor-pointer group">
							<div className="w-16 h-16 rounded-2xl bg-background-light border border-border flex items-center justify-center overflow-hidden group-hover:border-accent transition-colors">
								{imagePreview ? (
									<Image
										alt="DM 이미지"
										src={imagePreview}
										width={64}
										height={64}
										className="w-full h-full object-cover"
									/>
								) : (
									<svg
										className="w-6 h-6 text-foreground-dim"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.5}
									>
										<path d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
										<path d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
									</svg>
								)}
							</div>
							<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
								<svg
									className="w-3 h-3 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
							</div>
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageChange}
							/>
						</label>
					</div>

					{/* Title */}
					<div className="mb-4">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							제목
						</label>
						<input
							type="text"
							className="w-full h-11 px-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="대화 제목을 입력하세요"
							required
						/>
					</div>

					{/* Selected Recipients */}
					{recipients.length > 0 && (
						<div className="mb-4">
							<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
								선택된 수신자
							</label>
							<div className="flex flex-wrap gap-1.5">
								{recipients.map((recipient) => (
									<div
										key={recipient.id}
										className="flex items-center gap-1.5 bg-accent/15 text-accent rounded-lg px-2.5 py-1"
									>
										<span className="text-xs font-medium">
											{recipient.label}
										</span>
										<button
											type="button"
											onClick={() => removeRecipient(recipient.id)}
											className="w-4 h-4 flex items-center justify-center rounded hover:bg-accent/20 transition-colors"
										>
											<svg
												className="w-3 h-3"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2.5}
											>
												<path d="M6 18 18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Recipient Search */}
					<div className="mb-6">
						<label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
							수신자 검색
						</label>
						<div className="relative mb-2">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.3-4.3" />
							</svg>
							<input
								className="w-full h-10 pl-9 pr-4 bg-background-light border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-dim"
								value={searchText}
								onChange={handleSearchUserTag}
								placeholder="태그로 검색..."
							/>
						</div>
						<div className="bg-background-light border border-border rounded-xl overflow-hidden max-h-36 overflow-y-auto">
							{searchedUsers.length === 0 ? (
								<p className="px-4 py-3 text-xs text-foreground-dim text-center">
									{searchText ? '결과 없음' : '태그를 검색하세요'}
								</p>
							) : (
								searchedUsers.map((profile) => {
									const isSelected = recipients.some(
										(r) => String(r.id) === String(profile.id)
									)
									return (
										<div
											key={profile.id}
											className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-accent/10' : 'hover:bg-background'}`}
											onClick={() => {
												if (isSelected) {
													removeRecipient(profile.id)
												} else {
													setRecipients((prev) => [
														...prev,
														{
															id: profile.id,
															label: profile.name ?? profile.tag,
														},
													])
												}
											}}
										>
											<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
												{(profile.name ?? profile.tag).charAt(0).toUpperCase()}
											</div>
											<span className="text-sm text-foreground flex-1 truncate">
												{profile.name ?? profile.tag}
											</span>
											{isSelected && (
												<svg
													className="w-4 h-4 text-accent shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={2.5}
												>
													<path d="m4.5 12.75 6 6 9-13.5" />
												</svg>
											)}
										</div>
									)
								})
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-light transition-colors"
						>
							취소
						</button>
						<button
							type="submit"
							className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
							disabled={!title.trim() || recipients.length === 0}
						>
							만들기
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

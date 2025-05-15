'use client'
import { useAppSelector } from '@/src/lib/hooks'
import {
	GetProfilesResponseSchema,
	Profile,
} from '@/src/lib/schemas/profile.schema'
import { fetchWithValidation } from '@/src/lib/util'
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
			id: number
			label: string
		}[]
	>([])
	const [searchText, setSearchText] = useState<string>('')
	const [searchedUsers, setSearchedUsers] = useState<Profile[]>([])

	const handleRecipientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
			id: Number(option.value),
			label: option.innerText,
		}))
		setRecipients(
			selectedOptions.filter((selectedOption) => !isNaN(selectedOption.id))
		)
	}

	const removeRecipient = (id: number) => {
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
				participants: recipients.map((recipient) => recipient.id),
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50">
			<div className="bg-background-light rounded-lg shadow-lg w-96 p-6">
				<h2 className="text-xl font-semibold mb-4">새 DM 생성</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label>
							<Image
								alt="DM 이미지"
								src={imagePreview}
								width={0}
								height={0}
								className="w-14 h-14"
							/>
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageChange}
							/>
						</label>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium mb-1">제목</label>
						<input
							type="text"
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium mb-1">
							선택된 수신자
						</label>
						<div className="flex space-x-2 overflow-x-auto p-1 border rounded">
							{recipients.length === 0 ? (
								<span className="text-gray-500">수신자가 없습니다.</span>
							) : (
								recipients.map((recipient) => {
									const user = searchedUsers.find(
										(u) => String(u.id) === String(recipient.id)
									)
									return (
										<div
											key={recipient.id}
											className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 whitespace-nowrap"
										>
											<span className="text-sm">{recipient.label}</span>
											<button
												type="button"
												onClick={() => removeRecipient(recipient.id)}
												className="ml-2 hover:text-blue-600"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									)
								})
							)}
						</div>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium mb-1">
							수신자 선택
						</label>
						<div className="flex flex-col border">
							<input
								className="m-1 border px-2 py-1"
								value={searchText}
								onChange={handleSearchUserTag}
								placeholder="태그로 검색..."
							/>
							<select
								multiple
								className="w-full h-32 px-3 py-2 focus:outline-none"
								value={recipients.map((recipient) => String(recipient.id))}
								onChange={handleRecipientsChange}
							>
								{searchedUsers.length === 0 ? (
									<option disabled>사용자가 없습니다.</option>
								) : (
									searchedUsers.map((profile) => (
										<option key={profile.id} value={String(profile.id)}>
											{profile.name ?? profile.tag}
										</option>
									))
								)}
							</select>
						</div>
					</div>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>
							취소
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							생성
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

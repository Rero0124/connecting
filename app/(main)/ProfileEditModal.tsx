'use client'

import { VerifySessionType } from '@/src/lib/session'
import { getSession } from '@/src/lib/util'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
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
				const response = await fetch(
					`/api/users/${session.userId}/profiles/${session.profileId}`,
					{
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							userName: userName || undefined,
							statusName: statusName || undefined,
							information: information || undefined,
							image: imageEncoded || undefined,
						}),
					}
				)

				const result = await response.json()
				if (response.ok && result.result) {
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
			<div className="relative w-[800px] bg-[#1e1f22] rounded-xl overflow-hidden border border-gray-700 shadow-lg">
				<div className="bg-blue-800 h-36 relative">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-white text-2xl hover:opacity-80"
					>
						×
					</button>
					<div className="absolute left-6 bottom-[-45px]">
						<label className="cursor-pointer relative group">
							<input
								type="file"
								className="hidden"
								onChange={handleImageChange}
							/>
							{imagePreview ? (
								<Image
									src={imagePreview}
									alt="프로필"
									width={0}
									height={0}
									className="w-24 h-24 rounded-full border-4 border-[#1e1f22] object-cover"
								/>
							) : (
								<div className="w-24 h-24 rounded-full border-4 border-[#1e1f22] bg-gray-700 flex items-center justify-center text-white">
									No Image
								</div>
							)}
							<div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-xs text-center text-white py-0.5 opacity-0 group-hover:opacity-100">
								사진 변경
							</div>
						</label>
					</div>
				</div>

				<div className="pt-16 px-8 pb-8 text-white">
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-2xl font-bold">
								{userName || '프로필 이름'}
							</h2>
							<p className="text-sm text-gray-400">{initialData.userTag}</p>
						</div>
						<button
							onClick={handleSave}
							className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded"
						>
							저장
						</button>
					</div>

					<div className="space-y-6">
						<div>
							<label className="text-sm text-gray-400">별명 (user_name)</label>
							<input
								type="text"
								value={userName}
								onChange={(e) => setUserName(e.target.value)}
								className="mt-1 w-full p-2 bg-[#2a2b2e] rounded border border-gray-600 text-white"
								placeholder="별명을 입력하세요"
							/>
						</div>

						<div>
							<label className="text-sm text-gray-400">
								상태 메시지 (status_name)
							</label>
							<input
								type="text"
								value={statusName}
								onChange={(e) => setStatusName(e.target.value)}
								className="mt-1 w-full p-2 bg-[#2a2b2e] rounded border border-gray-600 text-white"
								placeholder="상태 메시지를 입력하세요"
							/>
						</div>

						<div>
							<label className="text-sm text-gray-400">
								한 줄 소개 (information)
							</label>
							<textarea
								value={information}
								onChange={(e) => setInformation(e.target.value)}
								className="mt-1 w-full p-2 bg-[#2a2b2e] rounded border border-gray-600 text-white"
								rows={3}
								placeholder="소개글을 입력하세요"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

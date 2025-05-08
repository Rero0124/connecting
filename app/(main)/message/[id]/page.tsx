'use client'

import { setDmDetail } from '@/src/lib/features/dmData/dmDataSlice'
import { useAppDispatch, useAppSelector } from '@/src/lib/hooks'
import { useVoiceCall } from '@/src/lib/hooks/useVoiceCall'
import { GetDmSessionResponseSchema } from '@/src/lib/schemas/dm.schema'
import { fetchWithZod, serializeDatesForRedux } from '@/src/lib/util'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Main() {
	const dmData = useAppSelector((state) => state.dmData)
	const saveData = useAppSelector((state) => state.saveData)
	const dispatch = useAppDispatch()
	const {
		startCalling,
		stopCalling,
		toggleMic,
		isMicOn,
		toggleCamera,
		isCameraOn,
		toggleScreen,
		isScreenOn,
	} = useVoiceCall()
	const [pendingMessage, setPendingMessage] = useState<string>('')
	const [isCalling, setIsCalling] = useState(false)
	let pastMessageProfileId = -1

	const { id } = useParams<{ id: string }>()

	const submitMessage = (e: React.FormEvent) => {
		e.preventDefault()
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions/${id}/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ message: pendingMessage }),
		}).then((res) => res.json())
		setPendingMessage('')
	}

	const handleCallingStart = () => {
		setIsCalling(true)
		startCalling(id)
	}

	const handleCallingStop = () => {
		setIsCalling(false)
		stopCalling()
	}

	const handleCallingMute = () => {
		toggleMic()
	}

	const handleCamera = () => {
		toggleCamera()
	}

	const handleScreenShare = () => {
		toggleScreen()
	}

	useEffect(() => {
		if (!dmData.dmDetails[id]) {
			fetchWithZod(`${process.env.NEXT_PUBLIC_API_URL}/dm-sessions/${id}`, {
				cache: 'no-store',
				dataSchema: GetDmSessionResponseSchema,
			}).then((data) => {
				if (data.status === 'success') {
					dispatch(setDmDetail(serializeDatesForRedux(data.data)))
				}
			})
		}
	}, [dmData])

	return (
		<div className="flex flex-col justify-between h-full">
			<div className="flex justify-between items-center h-12 border-b">
				<span className="ml-4">{dmData.dmDetails[id]?.name ?? ''}</span>
				<div className="flex justify-between">
					<div onClick={handleCallingStart}>통화</div>
				</div>
			</div>
			{isCalling && (
				<div className="flex grow">
					<span>통화중</span>
					<div onClick={handleCallingStop}>전화끊기</div>
					<div onClick={handleCallingMute}>
						마이크{isMicOn ? '끄기' : '켜기'}
					</div>
					<div onClick={handleCamera}>카메라{isCameraOn ? '끄기' : '켜기'}</div>
					<div onClick={handleScreenShare}>
						화면공유{isScreenOn ? '끄기' : '켜기'}
					</div>
				</div>
			)}
			<div className="flex flex-col grow overflow-y-auto h-0">
				{dmData.dmDetails[id] &&
					dmData.dmDetails[id].message.map((message, idx) => {
						const pastMessageSameUser =
							message.profileId === pastMessageProfileId
						pastMessageProfileId = message.profileId
						const nextMessageSameDate =
							dmData.dmDetails[id].message.length - 1 > idx
								? new Date(message.sentAt).toLocaleString() ===
									new Date(
										dmData.dmDetails[id].message[idx + 1].sentAt
									).toLocaleString()
								: false
						return message.profileId !== saveData.profile?.id ? (
							<div
								key={`DmMessage_${message.dmSessionId}_${message.id}`}
								className="flex justify-start px-1"
							>
								{!pastMessageSameUser ? (
									<>
										<Image
											alt="프로필"
											src={message.profile.image}
											width={0}
											height={0}
											className="w-14 h-14"
										/>
										<div className="flex flex-col">
											<p>
												<span className="text-lg">
													{message.profile.name ?? message.profile.tag}
												</span>
												<span className="ml-2 text-sm">
													{new Date(message.sentAt).toLocaleString()}
												</span>
											</p>
											<span>{message.content}</span>
										</div>
									</>
								) : (
									<>
										<span className="ml-14">{message.content}</span>
									</>
								)}
							</div>
						) : (
							<div
								key={`DmMessage_${message.dmSessionId}_${message.id}`}
								className="flex justify-end"
							>
								<span>{message.content}</span>
							</div>
						)
					})}
			</div>
			<div className="p-3 h-16">
				<form className="flex" onSubmit={submitMessage}>
					<input
						className="grow p-2 border rounded-md"
						value={pendingMessage}
						onChange={(e) => {
							setPendingMessage(e.currentTarget.value)
						}}
					/>
					<button className="w-16 p-2 ml-2 border rounded-md">보내기</button>
				</form>
			</div>
		</div>
	)
}

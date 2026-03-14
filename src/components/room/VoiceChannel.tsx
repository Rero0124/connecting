'use client'

import { useVoiceCall } from '@/src/hooks/useVoiceCall'
import { useAppSelector } from '@/src/lib/hooks'
import { useEffect, useRef } from 'react'

interface VoiceChannelProps {
	roomId: string
	channelId: string
	channelName: string
}

function RemoteAudio({ stream }: { stream: MediaStream }) {
	const ref = useRef<HTMLAudioElement>(null)
	useEffect(() => {
		if (ref.current) {
			ref.current.srcObject = stream
		}
	}, [stream])
	return <audio ref={ref} autoPlay />
}

function VideoTile({
	stream,
	muted = false,
	mirrored = false,
	label,
	sublabel,
	isScreen = false,
}: {
	stream: MediaStream
	muted?: boolean
	mirrored?: boolean
	label: string
	sublabel?: string
	isScreen?: boolean
}) {
	const ref = useRef<HTMLVideoElement>(null)
	useEffect(() => {
		if (ref.current) {
			ref.current.srcObject = stream
		}
	}, [stream])
	return (
		<div className="relative bg-background-light rounded-xl overflow-hidden group">
			<video
				ref={ref}
				autoPlay
				playsInline
				muted={muted}
				className={`w-full h-full object-${isScreen ? 'contain' : 'cover'}${mirrored ? ' -scale-x-100' : ''}`}
			/>
			<div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
				<span className="text-xs font-medium text-white">{label}</span>
				{sublabel && (
					<span className="text-[10px] text-white/60 ml-1.5">{sublabel}</span>
				)}
			</div>
		</div>
	)
}

export default function VoiceChannel({
	roomId,
	channelId,
	channelName,
}: VoiceChannelProps) {
	const session = useAppSelector((state) => state.session.session)
	const profileId = session.isAuth ? Number(session.profileId) : 0
	const callId = `room_${roomId}_voice_${channelId}`

	const {
		joined,
		micOn,
		cameraOn,
		screenOn,
		localCameraStream,
		localScreenStream,
		remotePeers,
		join,
		leave,
		toggleMic,
		toggleCamera,
		toggleScreen,
	} = useVoiceCall(callId, profileId)

	// Count total video tiles
	const remoteVideoPeers = Array.from(remotePeers.values()).filter(
		(p) => p.state.isCameraOn || p.state.isScreenOn
	)
	const localVideoCount = (cameraOn ? 1 : 0) + (screenOn ? 1 : 0)
	const totalVideoCount = remoteVideoPeers.length + localVideoCount

	// Determine grid layout based on video count
	const getGridClass = () => {
		if (totalVideoCount === 0) return ''
		if (totalVideoCount === 1) return 'grid grid-cols-1'
		if (totalVideoCount === 2) return 'grid grid-cols-2'
		if (totalVideoCount <= 4) return 'grid grid-cols-2 grid-rows-2'
		return 'grid grid-cols-3'
	}

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<div className="flex items-center h-12 px-4 border-b border-border shrink-0">
				<svg
					className="w-4 h-4 mr-2 text-foreground-dim"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.8}
				>
					<path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
				</svg>
				<span className="text-sm font-semibold text-foreground">
					{channelName}
				</span>
				{joined && (
					<span className="ml-2 text-xs text-green-400">● 연결됨</span>
				)}
			</div>

			{/* Main area */}
			<div className="flex-1 flex flex-col overflow-hidden p-4">
				{!joined ? (
					<div className="flex flex-col items-center justify-center flex-1 gap-4">
						<div className="w-20 h-20 rounded-full bg-background-light flex items-center justify-center">
							<svg
								className="w-10 h-10 text-foreground-dim"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.2}
							>
								<path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
							</svg>
						</div>
						<p className="text-foreground-dim text-sm">
							음성 채널에 참여하려면 아래 버튼을 누르세요
						</p>
						<button
							onClick={join}
							className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
						>
							음성 채널 참여
						</button>
					</div>
				) : (
					<>
						{/* Video grid */}
						{totalVideoCount > 0 ? (
							<div className={`${getGridClass()} gap-2 flex-1 min-h-0`}>
								{/* Local screen share (shown larger / first like Discord) */}
								{screenOn && localScreenStream && (
									<div className={`${totalVideoCount === 1 ? '' : totalVideoCount === 2 && !cameraOn ? '' : 'col-span-full'} aspect-video`}>
										<VideoTile
											stream={localScreenStream}
											muted
											label="내 화면"
											sublabel="화면 공유"
											isScreen
										/>
									</div>
								)}

								{/* Local camera */}
								{cameraOn && localCameraStream && (
									<div className="aspect-video">
										<VideoTile
											stream={localCameraStream}
											muted
											mirrored
											label="나"
											sublabel="카메라"
										/>
									</div>
								)}

								{/* Remote peers with video */}
								{remoteVideoPeers.map((peer) => (
									<div key={peer.socketId} className="aspect-video">
										<VideoTile
											stream={peer.stream}
											label={`${peer.state.profileId ?? '?'}`}
											sublabel={peer.state.isScreenOn ? '화면 공유' : '카메라'}
											isScreen={peer.state.isScreenOn ?? false}
										/>
									</div>
								))}
							</div>
						) : (
							/* No video - show participant circles */
							<div className="flex-1 flex items-center justify-center">
								<div className="flex flex-wrap items-center justify-center gap-4">
									{/* Self */}
									<div className="flex flex-col items-center gap-1.5">
										<div
											className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-offset-2 ring-offset-background transition-all ${
												micOn ? 'bg-accent ring-accent/50' : 'bg-foreground-dim ring-transparent'
											}`}
										>
											나
										</div>
										<span className="text-xs text-foreground-dim">
											{micOn ? '마이크 켜짐' : '음소거'}
										</span>
									</div>

									{/* Remote peers */}
									{Array.from(remotePeers.values()).map((peer) => (
										<div
											key={peer.socketId}
											className="flex flex-col items-center gap-1.5"
										>
											<div
												className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-offset-2 ring-offset-background transition-all ${
													peer.state.isMicOn ? 'bg-accent ring-accent/50' : 'bg-foreground-dim ring-transparent'
												}`}
											>
												{peer.state.profileId ?? '?'}
											</div>
											<span className="text-xs text-foreground-dim">
												{peer.state.isMicOn ? '말하는 중' : '음소거'}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Participants bar when video is active */}
						{totalVideoCount > 0 && (
							<div className="flex items-center gap-2 mt-3 px-2 py-2 bg-background-secondary rounded-lg shrink-0">
								{/* Self mini */}
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
										micOn ? 'bg-accent' : 'bg-foreground-dim'
									}`}
									title={micOn ? '마이크 켜짐' : '음소거'}
								>
									나
								</div>
								{/* Remote peers mini */}
								{Array.from(remotePeers.values()).map((peer) => (
									<div
										key={`mini_${peer.socketId}`}
										className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
											peer.state.isMicOn ? 'bg-accent' : 'bg-foreground-dim'
										}`}
										title={peer.state.isMicOn ? '말하는 중' : '음소거'}
									>
										{peer.state.profileId ?? '?'}
									</div>
								))}
							</div>
						)}

						{/* Hidden audio elements for remote peers */}
						{Array.from(remotePeers.values()).map((peer) => (
							<RemoteAudio
								key={`audio_${peer.socketId}`}
								stream={peer.stream}
							/>
						))}
					</>
				)}
			</div>

			{/* Control bar */}
			{joined && (
				<div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-background-secondary shrink-0">
					{/* Mic toggle */}
					<button
						onClick={toggleMic}
						className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
							micOn
								? 'bg-background-light text-foreground hover:bg-background'
								: 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
						}`}
						title={micOn ? '마이크 끄기' : '마이크 켜기'}
					>
						{micOn ? (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
							</svg>
						) : (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="m3 3 18 18M12 18.75a6 6 0 0 0 6-6v-1.5M12 18.75a6 6 0 0 1-6-6v-1.5M12 18.75v3.75m-3.75 0h7.5M9 4.5a3 3 0 0 1 6 0v8.25" />
							</svg>
						)}
					</button>

					{/* Camera toggle */}
					<button
						onClick={toggleCamera}
						className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
							cameraOn
								? 'bg-accent/20 text-accent hover:bg-accent/30'
								: 'bg-background-light text-foreground-dim hover:bg-background'
						}`}
						title={cameraOn ? '카메라 끄기' : '카메라 켜기'}
					>
						{cameraOn ? (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
							</svg>
						) : (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.8}
							>
								<path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m14.25 0a2.25 2.25 0 0 0-2.25-2.25H6M3 3l18 18" />
							</svg>
						)}
					</button>

					{/* Screen share toggle */}
					<button
						onClick={toggleScreen}
						className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
							screenOn
								? 'bg-accent/20 text-accent hover:bg-accent/30'
								: 'bg-background-light text-foreground-dim hover:bg-background'
						}`}
						title={screenOn ? '화면 공유 중지' : '화면 공유'}
					>
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
						</svg>
					</button>

					{/* Leave */}
					<button
						onClick={leave}
						className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors ml-2"
						title="통화 나가기"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.8}
						>
							<path d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
						</svg>
					</button>
				</div>
			)}
		</div>
	)
}

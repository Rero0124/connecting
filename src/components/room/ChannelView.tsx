'use client'

import { useAppSelector } from '@/src/lib/hooks'
import { deserializeData } from '@/src/lib/util'
import { RoomChannel } from '@/src/components/room/RoomChannel'
import VoiceChannel from '@/src/components/room/VoiceChannel'

interface ChannelViewProps {
	roomId: string
	channelId: bigint | null
}

export default function ChannelView({ roomId, channelId }: ChannelViewProps) {
	const roomState = useAppSelector((state) => state.room)
	const roomDetail = roomState.roomDetails[roomState.roomDetailIdx[roomId]?.idx]

	const channel = roomDetail?.channel.find((ch) => {
		const parsed = deserializeData(ch)
		return String(parsed.id) === String(channelId)
	})

	const channelData = channel ? deserializeData(channel) : null
	const isVoice = channelData?.type === 'voice'

	if (isVoice && channelData) {
		return (
			<div className="flex flex-col grow min-w-0 overflow-hidden">
				<VoiceChannel
					roomId={roomId}
					channelId={String(channelId)}
					channelName={channelData.name}
				/>
			</div>
		)
	}

	return (
		<div className="flex flex-col grow min-w-0 overflow-hidden">
			<RoomChannel roomId={roomId} channelId={channelId} />
		</div>
	)
}

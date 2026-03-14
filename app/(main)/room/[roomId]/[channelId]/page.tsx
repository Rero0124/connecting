import ChannelView from '@/src/components/room/ChannelView'
import RoomNav from '@/src/components/room/RoomNav'
import { toBigInt } from '@/src/lib/util'

export default async function Layout({
	params,
}: {
	params: Promise<{ roomId: string; channelId: string }>
}) {
	const { roomId, channelId } = await params

	return (
		<>
			<RoomNav roomId={roomId} channelId={toBigInt(channelId)} />
			<ChannelView roomId={roomId} channelId={toBigInt(channelId)} />
		</>
	)
}

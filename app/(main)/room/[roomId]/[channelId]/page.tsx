import { RoomChannel } from '@/src/components/room/RoomChannel'
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
			<RoomChannel roomId={roomId} channelId={toBigInt(channelId)} />
		</>
	)
}

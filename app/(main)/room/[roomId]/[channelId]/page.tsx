import { RoomChannel } from '@/src/components/room/RoomChannel'
import { toBigInt } from '@/src/lib/util'

export default async function Layout({
	params,
}: {
	params: Promise<{ roomId: string; channelId: string }>
}) {
	const { roomId, channelId } = await params

	return <RoomChannel roomId={roomId} channelId={toBigInt(channelId)} />
}

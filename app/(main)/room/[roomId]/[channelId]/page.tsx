import { RoomChannel } from '@/src/components/room/RoomChannel'

export default async function Layout({
	params,
}: {
	params: Promise<{ roomId: string; channelId: string }>
}) {
	const { roomId, channelId } = await params
	const channelIdNumber = isNaN(Number(channelId)) ? -1 : Number(channelId)

	return <RoomChannel roomId={roomId} channelId={channelIdNumber} />
}

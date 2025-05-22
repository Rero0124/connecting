import RoomNav from '@/src/components/room/RoomNav'
import { getFirstChannelInRoom } from '@/src/lib/cacheUtil'
import { redirect } from 'next/navigation'

export default async function Main({
	params,
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	const channel = await getFirstChannelInRoom(roomId)

	if (channel) redirect(`/room/${roomId}/${channel.id}`)

	return (
		<>
			<RoomNav roomId={roomId} />
			<div className="flex flex-col h-full w-full items-center justify-center">
				<p className="text-2xl font-bold">채팅방이 없습니다.</p>
				<p className="text-2xl font-bold">먼저 채팅방을 만들어주세요.</p>
			</div>
		</>
	)
}

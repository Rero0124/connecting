import FriendAdd from '@/src/components/friendRequest/FriendAdd'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '친구 추가',
}

export default function FriendRequestPage() {
	return <FriendAdd />
}

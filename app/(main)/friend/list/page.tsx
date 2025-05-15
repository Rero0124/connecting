import FriendList from '@/src/components/friendRequest/FriendList'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '친구 목록',
}

export default function FriendListPage() {
	return <FriendList />
}

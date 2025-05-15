import FriendManage from '@/src/components/friendRequest/FriendManage'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '친구 관리',
}

export default function FriendManagePage() {
	return <FriendManage />
}

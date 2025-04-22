'use client'

import { redirect } from 'next/navigation'

export default function Logout() {
	fetch('/api/auth', {
		method: 'DELETE',
	}).then(() => {
		redirect('/')
	})
	return <div>로그아웃 중입니다.</div>
}

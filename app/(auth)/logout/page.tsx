'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function LogoutPage() {
	useEffect(() => {
		fetch('/api/session', {
			method: 'DELETE',
		}).then(() => {
			redirect('/')
		})
	}, [])
	return <div>로그아웃 중입니다.</div>
}

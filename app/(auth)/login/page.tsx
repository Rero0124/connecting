import LoginForm from '@/src/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '로그인',
}

export default async function Login() {
	return <LoginForm />
}

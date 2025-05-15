import JoinForm from '@/src/components/auth/JoinForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '회원가입',
}

export default function Join() {
	return <JoinForm />
}

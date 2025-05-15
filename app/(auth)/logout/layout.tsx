import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '로그아웃 중..',
}

export default function LogoutLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <>{children}</>
}

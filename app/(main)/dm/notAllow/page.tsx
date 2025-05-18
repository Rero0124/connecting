import NotAllowedDmSession from '@/src/components/dm/NotAllowedDmSession'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: '메세지 요청 & 스팸',
}

export default async function Main() {
	return (
		<div className="">
			<main className="">
				<NotAllowedDmSession />
			</main>
		</div>
	)
}

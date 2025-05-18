import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Main() {
	const viewContext = (await cookies()).get('viewContext')?.value

	switch (viewContext) {
		case 'list':
			redirect('/friend/list')
		case 'request':
			redirect('/friend/request')
		case 'manage':
			redirect('/friend/manage')
		default:
			redirect('/friend/list')
	}
}

import { redirect } from 'next/navigation'
import { getFirstDmSession } from '@/src/lib/cacheUtil'

export default async function Main() {
	const dmSession = await getFirstDmSession()

	dmSession ? redirect(`/dm/session/${dmSession.id}`) : redirect('/dm')
}

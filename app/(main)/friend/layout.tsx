import { Metadata } from 'next'

export const metadata: Metadata = {
	title: {
		default: '친구',
		template: `친구 | %s`,
	},
}

export default async function Layout({
	children,
	nav,
}: Readonly<{
	children: React.ReactNode
	nav: React.ReactNode
}>) {
	return (
		<>
			{nav}
			<div className="grow">{children}</div>
			<div className="flex flex-col w-72 border-l-[1px]">
				<div className="block h-12 px-2.5 py-0.5 leading-12">현재 활동중</div>
			</div>
		</>
	)
}

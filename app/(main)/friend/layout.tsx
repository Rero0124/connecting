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
			<div className="flex flex-col grow overflow-hidden">{children}</div>
			<div className="flex flex-col w-60 border-l border-border bg-background-secondary shrink-0">
				<div className="flex items-center h-12 px-4 border-b border-border">
					<span className="text-xs font-semibold text-foreground-dim uppercase tracking-wider">
						현재 활동중
					</span>
				</div>
				<div className="flex flex-col items-center justify-center flex-1 text-foreground-dim">
					<svg
						className="w-10 h-10 mb-2 opacity-20"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1}
					>
						<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
					</svg>
					<p className="text-xs">활동 중인 친구 없음</p>
				</div>
			</div>
		</>
	)
}

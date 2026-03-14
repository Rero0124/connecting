import { Metadata } from 'next'

export const metadata: Metadata = {
	title: {
		default: '',
		template: `DM | %s`,
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
						중요 알림
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
						<path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
					</svg>
					<p className="text-xs">새로운 알림 없음</p>
				</div>
			</div>
		</>
	)
}

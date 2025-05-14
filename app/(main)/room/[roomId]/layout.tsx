export default function Layout({
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
				<div className="block h-12 px-2.5 py-0.5 leading-12">
					중요 알림 (친한친구 채팅 및 약속)
				</div>
			</div>
		</>
	)
}

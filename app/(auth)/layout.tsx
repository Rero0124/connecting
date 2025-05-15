export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex flex-row justify-center items-center h-full">
			{children}
		</div>
	)
}

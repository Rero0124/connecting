export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="relative flex justify-center items-center h-full bg-background overflow-hidden">
			{/* Background gradient orbs */}
			<div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
			<div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
			{children}
		</div>
	)
}

export function getCookieValue(name: string) {
	const regex = new RegExp(`(^| )${name}=([^;]+)`)
	if (typeof document !== 'undefined') {
		const match = document.cookie.match(regex)
		if (match) {
			return match[2]
		}
	}
}

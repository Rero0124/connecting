import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	async redirects() {
		return [
			{
				source: '/',
				destination: '/dm',
				permanent: true,
			},
		]
	},
	experimental: {
		useCache: true,
	},
	allowedDevOrigins: ['connecting.rero0124.com'],
}

export default nextConfig

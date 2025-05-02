import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
	// import.meta.dirname is available after Node.js v20.11.0
	baseDirectory: import.meta.dirname,
})

const eslintConfig = [
	{
		ignores: [
			'node_modules/**',
			'.yarn/**',
			'.next/**',
			'.pnp/**',
			'.pnp.*',
			'out/**',
			'build/**',
			'coverage/**',
			'.DS_Store',
			'*.pem',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',
			'.pnpm-debug.log*',
			'.vercel',
			'*.tsbuildinfo',
			'src/types/**',
		],
	},
	...compat.config({
		extends: ['next', 'plugin:prettier/recommended'],
		rules: {
			'react/no-unescaped-entities': 'off',
			'@next/next/no-page-custom-font': 'off',
			'react-hooks/exhaustive-deps': 'off',
		},
	}),
]

export default eslintConfig

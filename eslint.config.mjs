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
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'react/no-unescaped-entities': 'off',
			'@next/next/no-page-custom-font': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						// 1. Node.js built-ins
						['^node:'],
						// 2. External packages
						['^@?\\w'],
						// 3. Aliased paths (src alias)
						['^@/'],
						// 4. Parent imports
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						// 5. Relative imports
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						// 6. Side effect imports
						['^\\u0000'],
						// 7. Style imports
						['\\.css$', '\\.scss$', '\\.tailwind$'],
					],
				},
			],
		'simple-import-sort/exports': 'error',
		},
	}),
]

export default eslintConfig

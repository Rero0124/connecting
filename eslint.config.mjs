import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
	// import.meta.dirname is available after Node.js v20.11.0
	baseDirectory: import.meta.dirname,
})

const eslintConfig = [
	{
		ignores: ['.yarn/**', 'node_modules/**', 'build/**', 'dist/**', '**/*.cjs'],
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

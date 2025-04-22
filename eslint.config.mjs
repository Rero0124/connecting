import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from "eslint-config-prettier/flat";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next', 'prettier'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  }),
  eslintConfigPrettier
]

export default eslintConfig
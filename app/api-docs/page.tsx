'use client'

import { openApiDocument } from '@/src/lib/openapi/document'
import { RedocStandalone } from 'redoc'

export default function ApiDocsPage() {
	return <RedocStandalone spec={openApiDocument} />
}

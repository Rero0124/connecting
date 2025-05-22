import { createDocument } from 'zod-openapi'
import apiPath from './routes/api'
import authenticatePath from './routes/authenticate'
import dmSessionsPath from './routes/dm-sessions'

export const openApiDocument = createDocument({
	openapi: '3.1.0',
	info: {
		title: 'Messenger API',
		version: '1.0.0',
	},
	paths: {
		...apiPath,
		...authenticatePath,
		...dmSessionsPath,
	},
})

// auto-generated openapi route file for /dm-sessions\[dmSessionId]
import { ZodOpenApiPathsObject } from 'zod-openapi'
import dmParticipantsPath from './participants'
import dmMessagesPath from './messages'

export const dmSessionsByDmSessionIdPath: ZodOpenApiPathsObject = {
	...dmParticipantsPath,
	...dmMessagesPath,
}

import { io, Socket } from 'socket.io-client'
import {
	ClientToServerEvents,
	ServerToClientEvents,
} from '../server/socket/types'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	process.env.NEXT_PUBLIC_SOCKET_URL || undefined,
	{
		transports: ['polling', 'websocket'],
	}
)

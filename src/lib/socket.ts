import { ClientToServerEvents, ServerToClientEvents } from '@/socket'
import { io, Socket } from 'socket.io-client'

// export const socket = io()
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	process.env.NEXT_PUBLIC_SOCKET_URL
)

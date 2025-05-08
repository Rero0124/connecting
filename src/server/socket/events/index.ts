import { SocektGlobalData, SocketServer, SocketSocekt } from '../types'
import { registerCoreEvents } from './core'
import { registerCallEvents } from './call'

export async function registerSocketEvents(
	io: SocketServer,
	socket: SocketSocekt,
	globalData: SocektGlobalData
) {
	registerCoreEvents(io, socket, globalData)
	registerCallEvents(io, socket, globalData)

	socket.on('disconnect', async (reason) => {
		if (socket.data.profileId) {
			globalData.socketMap.delete(socket.data.profileId)
		}

		if (socket.data.callId) {
			socket
				.to(socket.data.callId)
				.emit('call_peerLeft', globalData.peerStates[socket.id])
		}

		if (globalData.sendTransports[socket.id]) {
			await globalData.sendTransports[socket.id].close()
			delete globalData.sendTransports[socket.id]
		}

		if (globalData.recvTransports[socket.id]) {
			await globalData.recvTransports[socket.id].close()
			delete globalData.recvTransports[socket.id]
		}

		if (globalData.producers[socket.id]) {
			for (const producer of globalData.producers[socket.id]) {
				await producer.close()
			}
			delete globalData.producers[socket.id]
		}

		if (globalData.peerStates[socket.id]) {
			delete globalData.peerStates[socket.id]
		}
	})
}

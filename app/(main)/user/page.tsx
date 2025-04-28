'use client'

import { useEffect, useState } from 'react'
import { socket } from '@/src/lib/socket'

export default function Main() {
	const [isConnected, setIsConnected] = useState(false)
	const [transport, setTransport] = useState('N/A')

	useEffect(() => {
		if (socket.connected) {
			onConnect()
		}

		function onConnect() {
			setIsConnected(true)
			setTransport(socket.io.engine.transport.name)

			socket.io.engine.on('upgrade', (transport) => {
				setTransport(transport.name)
			})
		}

		function onDisconnect() {
			setIsConnected(false)
			setTransport('N/A')
		}

		socket.on('connect', onConnect)
		socket.on('disconnect', onDisconnect)

		return () => {
			socket.off('connect', onConnect)
			socket.off('disconnect', onDisconnect)
		}
	}, [])

	return (
		<div className="">
			<main className="">
				<p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
				<p>Transport6s: {transport}</p>
			</main>
		</div>
	)
}

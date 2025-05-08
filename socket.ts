import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import http2 from 'http2'
import dotenv from 'dotenv'
import { setupSocket } from './src/server/socket'

dotenv.config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

const httpVersion = process.env.SOCKET_HTTP
const hostname = process.env.SOCKET_HOST ?? 'localhost'
const port = isNaN(Number(process.env.SOCKET_PORT))
	? 3000
	: Number(process.env.SOCKET_PORT)

let server
if (httpVersion === 'HTTP/2') {
	server = http2.createSecureServer({
		allowHTTP1: true,
		key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
		cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
	})
} else if (httpVersion === 'HTTPS') {
	server = https.createServer({
		key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
		cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
	})
} else if (httpVersion === 'HTTP/1') {
	server = http.createServer()
} else {
	new Error('invaild http version')
}

if (server) {
	setupSocket(server)

	server
		.once('error', (err) => {
			console.error(err)
			process.exit(1)
		})
		.listen(port, () => {
			console.log(
				`> Socket Ready on ${httpVersion === 'HTTP/1' ? 'http' : 'https'}://${hostname}:${port}`
			)
		})
}

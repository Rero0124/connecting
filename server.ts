import { readFileSync } from 'fs'
import http from 'http'
import https from 'https'
import next from 'next'
import dotenv from 'dotenv'
import { setupSocket } from './src/server/socket'

dotenv.config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

const dev = process.env.NODE_ENV !== 'production'
const isHttps = process.env.HTTPS === 'true'
const turbo = dev
const hostname = process.env.HOST ?? 'localhost'
const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)

const app = next({ dev, hostname, port, turbo })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
	let server
	if (isHttps) {
		server = https.createServer(
			{
				key: readFileSync('./_wildcard_.rero0124.com.key.pem'),
				cert: readFileSync('./_wildcard_.rero0124.com.crt.pem'),
			},
			handler
		)
	} else {
		server = http.createServer(handler)
	}

	await setupSocket(server)

	server
		.once('error', (err) => {
			console.error(err)
			process.exit(1)
		})
		.listen(port, () => {
			console.log(
				`> Ready on ${isHttps ? 'https' : 'http'}://${hostname}:${port}`
			)
		})
})

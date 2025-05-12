const { startElectron } = require('./src/server/electron')

require('dotenv').config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

startElectron()

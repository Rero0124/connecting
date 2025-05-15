const { startElectron } = require('./src/server/electron')

require('dotenv').config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env.local', '.env'] : ['.env'],
})

startElectron()

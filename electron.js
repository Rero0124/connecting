const { app, BrowserWindow } = require('electron')

require('dotenv').config({
	path:
		process.env.NODE_ENV !== 'production' ? ['.env', '.env.local'] : ['.env'],
})

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: require('path').join(__dirname, 'preload.js'),
		},
	})

	win.loadURL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000') // dev 모드용
}

app.whenReady().then(createWindow)

const { app, BrowserWindow } = require('electron')
const { addIpcMainHandlers } = require('./main')

function startElectron() {
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

		win.webContents.session.clearCache()

		win.loadURL('http://localhost:3000') // dev 모드용
	}

	app.whenReady().then(() => {
		addIpcMainHandlers()

		createWindow()
	})
}

module.exports = {
	startElectron,
}

const { desktopCapturer, ipcMain } = require('electron')

function addIpcMainHandlers() {
	ipcMain.handle('getSource', async () => {
		const windowSources = await desktopCapturer.getSources({
			types: ['window'],
			fetchWindowIcons: true,
			thumbnailSize: { width: 200, height: 150 },
		})

		const screenSources = await desktopCapturer.getSources({
			types: ['screen'],
			fetchWindowIcons: true,
			thumbnailSize: { width: 200, height: 150 },
		})

		return {
			windowSources: windowSources.map((source) => ({
				id: source.id,
				name: source.name,
				icon: source.thumbnail.toDataURL(),
			})),
			screenSources: screenSources.map((source) => ({
				id: source.id,
				name: source.name,
				icon: source.thumbnail.toDataURL(),
			})),
		}
	})
}

module.exports = {
	addIpcMainHandlers,
}

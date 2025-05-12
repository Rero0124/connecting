import { desktopCapturer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('screenShare', {
	getSources: async () => {
		const sources = await desktopCapturer.getSources({
			types: ['window', 'screen'],
			fetchWindowIcons: true,
			thumbnailSize: { width: 200, height: 150 },
		})

		return sources.map((source) => ({
			id: source.id,
			name: source.name,
			thumbnail: source.thumbnail.toDataURL(), // UI에 썸네일 표시 가능
		}))
	},

	getStream: async (sourceId) => {
		return await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: sourceId,
				},
			},
		})
	},
})

contextBridge.exposeInMainWorld('isElectron', true)

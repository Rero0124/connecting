const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('screenShare', {
	getSource: async () => await ipcRenderer.invoke('getSource'),
})

contextBridge.exposeInMainWorld('isElectron', true)

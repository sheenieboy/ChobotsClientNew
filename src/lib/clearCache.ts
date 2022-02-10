import * as Electron from 'electron';

// FIXME: why is this a function?
export function clearCache(window: Electron.BrowserWindow | null) {
	if (window != undefined) { window.webContents.session.clearCache(); }
}

/*
	xyz.puyo.club, xyz.puyo.club.chotopia
	Copyright (C) 2022, Puyo <hi@puyo.xyz>, all rights reserved.
*/

import * as Electron from 'electron';

// FIXME: why is this a function?
export function clearCache(window: Electron.BrowserWindow | null) {
	if (window != undefined) { window.webContents.session.clearCache(); }
}

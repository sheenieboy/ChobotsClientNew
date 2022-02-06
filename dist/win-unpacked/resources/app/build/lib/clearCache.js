"use strict";
/*
    xyz.puyo.club, xyz.puyo.club.chotopia
    Copyright (C) 2022, Puyo <hi@puyo.xyz>, all rights reserved.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
// FIXME: why is this a function?
function clearCache(window) {
    if (window != undefined) {
        window.webContents.session.clearCache();
    }
}
exports.clearCache = clearCache;

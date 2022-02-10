"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
// FIXME: why is this a function?
function clearCache(window) {
    if (window != undefined) {
        window.webContents.session.clearCache();
    }
}
exports.clearCache = clearCache;

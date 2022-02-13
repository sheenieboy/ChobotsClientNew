"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubWindow = void 0;
const Electron = __importStar(require("electron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const windowState_1 = require("./windowState");
// FIXME: same thing as i said about rootDir in updater
const rootDir = __dirname.replace(new RegExp('build/lib$'), '').replace(new RegExp('build\\\\lib$'), '');
const dialog = Electron.dialog;
// FIXME: again, load this better
let branding = {
    name: 'Chobots',
    iconPath: rootDir + '/build/icon.png',
    nutsUrl: 'https://get.chobots.world',
    rpcClientId: '930243959463239730',
    rpcDetails: '🔗 chobots.world',
    rpcLargeImage: 'chobots',
    rpcLargeImageText: 'Chobots ' + Electron.app.getVersion(),
    rpcSmallImage: 'small3',
    rpcSmallImageText: undefined
};
class ClubWindow {
    constructor(title, icon, buttons, currentPage, width, height) {
        // Set up our properties
        this._maximized = false;
        this._focused = false;
        this._fullscreen = false;
        this._muted = false;
        this._title = title;
        this._icon = (typeof icon == 'string') ? Electron.nativeImage.createFromPath(icon) : icon;
        this._buttons = buttons;
        this._currentPage = currentPage;
        // Set up BrowserWindow
        this.webviewContents = undefined;
        this.browser = new Electron.BrowserWindow({
            minWidth: 640,
            minHeight: 400,
            width: width,
            height: height,
            title: this.title,
            icon: this.icon,
            frame: false,
            transparent: true,
            webPreferences: {
                //preload: path.join(rootDir, 'preload.js'), // for when add preload
                nodeIntegration: true,
                plugins: true,
                webSecurity: false,
                webviewTag: true, // instead of iframe
            }
        });
        this.browser.setMenu(null);
        this.clearCache();
        // TODO: replace this with DevTools in the dropdown
        //this.browser.webContents.openDevTools({mode: 'undocked'});
        // Prevent navigating away from frame
        function handleRedirect(event, url) {
            console.error('frame tried to navigate to ' + url);
            event.preventDefault();
            // Electron.shell.openExternal(url);
        }
        this.browser.webContents.on('will-navigate', handleRedirect);
        this.browser.webContents.on('new-window', handleRedirect);
        // Update state
        this.browser.on('maximize', () => { this.maximized = this.browser.isMaximized(); });
        this.browser.on('unmaximize', () => { this.maximized = this.browser.isMaximized(); });
        this.browser.on('minimize', () => { this.focused = this.browser.isFocused(); });
        this.browser.on('restore', () => { this.focused = this.browser.isFocused(); });
        this.browser.on('enter-full-screen', () => { this.fullscreen = this.browser.isFullScreen(); });
        this.browser.on('leave-full-screen', () => { this.fullscreen = this.browser.isFullScreen(); });
        // Handle frame events
        this.browser.webContents.on('ipc-message', (event, channel, ...args) => { this.handleIpcMessage(event, channel, args); }); // we have to call it inside an arrow function, or this = EventEmitter and not ClubWindow
        this.browser.loadFile(path_1.default.join(rootDir, '/pages/frame.html')).catch(console.error);
        //this.browser.loadURL("https://chobots.world/index").catch(console.error);
        this.browser.webContents.on('did-stop-loading', () => {
            this.updateState();
        });
    }
    get title() { return this._title; }
    ;
    set title(value) { this._title = value; this.browser.setTitle(this._title); }
    ;
    get icon() { return this._icon; }
    ;
    set icon(value) { this._icon = value; this.browser.setIcon(this._icon); }
    get maximized() { return this._maximized; }
    ;
    set maximized(value) { this._maximized = value; this.sendState(); }
    ;
    get focused() { return this._focused; }
    ;
    set focused(value) { this._focused = value; this.sendState(); }
    ;
    get fullscreen() { return this._fullscreen; }
    ;
    set fullscreen(value) { this._fullscreen = value; this.sendState(); }
    ;
    get muted() { return this._muted; }
    ;
    set muted(value) { this._muted = value; this.sendState(); }
    ;
    get buttons() { return this._buttons; }
    set buttons(value) { this._buttons = value; this.sendState(); }
    ;
    get currentPage() { return this._currentPage; }
    ;
    set currentPage(value) { this._currentPage = value; this.sendState(); }
    ;
    handleIpcMessage(event, channel, args) {
        console.log('handling ipc message, channel ' + channel + ' args ' + args);
        switch (channel) {
            case "window":
                switch (args[0]) {
                    case "close":
                        this.browser.close();
                        break;
                    case "maximize":
                        this.maximized ? this.browser.restore() : this.browser.maximize();
                        break;
                    case "minimize":
                        this.browser.minimize();
                        break;
                    case "about":
                        Electron.dialog.showMessageBox(this.browser, {
                            icon: Electron.nativeImage.createFromPath(branding.iconPath),
                            title: 'About ' + branding.name,
                            type: 'none',
                            message: fs_1.default.readFileSync(path_1.default.join(rootDir, 'ABOUT.txt')).toString()
                        });
                        break;
                    case "navigate":
                        this.navigate(args[1]);
                        break;
                }
                break;
            case "buttons":
                switch (args[0]) {
                    case "ingame":
                        switch (args[1]) {
                            case "fullscreen":
                                this.fullscreen ? this.browser.setFullScreen(false) : this.browser.setFullScreen(true);
                                break;
                            case "mute":
                                this.muted ? this.browser.webContents.audioMuted = false : this.browser.webContents.audioMuted = true;
                                this.muted = this.browser.webContents.audioMuted;
                                break;
                            case "reload":
                                this.clearCache();
                                this.navigate(this.currentPage.url);
                                break;
                            case "chobotsworld":
                                this.clearCache();
                                this.navigate("https://chobots.world/fullscreen");
                                break;
                            case "chotopiaus":
                                this.clearCache();
                                //this.navigate(`${rootDir}/pages/game.html`);
                                this.navigate(`https://chotopia.us/game12/game2.html`);
                                break;
                            case "chobotsca":
                                this.clearCache();
                                this.navigate("https://chobots.ca/game/");
                                break;
                            default:
                                console.error('tried to click a button that does not exist, on a layout that DOES exist');
                                break;
                        }
                        break;
                    default:
                        console.error('tried to click a button on a button layout that does not exist');
                        break;
                }
                break;
            case "dialog":
                Electron.dialog.showMessageBoxSync(this.browser, args[0]);
                break;
            case "containerIsReady":
                console.log('got container is ready');
                this.webviewContents = Electron.webContents.fromId(args[0]);
                this.webviewContents.on('ipc-message', this.handleIpcMessage);
                break;
            default:
                // this message is not for us
                break;
        }
    }
    clearCache() { return this.browser.webContents.session.clearCache(); }
    navigate(url) { return this.currentPage = new windowState_1.PageState(url); }
    sendState() {
        return this.browser.webContents.send('stateUpdate', {
            maximized: this._maximized,
            focused: this._focused,
            fullscreen: this._fullscreen,
            muted: this._muted,
            buttons: this._buttons,
            currentPage: this._currentPage
        }); // TODO: get rid of WindowState type?
    }
    updateState() {
        console.log('updating state');
        this._maximized = this.browser.isMaximized();
        this._focused = this.browser.isFocused();
        this._fullscreen = this.browser.isFullScreen();
        this._muted = this.browser.webContents.audioMuted;
        return this.sendState();
    }
}
exports.ClubWindow = ClubWindow;

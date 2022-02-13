import * as Electron from 'electron';
import fs from "fs";
import path from "path";
import { PageState } from "./windowState";
import { Branding } from "./branding";
import { WindowState } from "./windowState";
// FIXME: same thing as i said about rootDir in updater
const rootDir = __dirname.replace(new RegExp('build/lib$'), '').replace(new RegExp('build\\\\lib$'), '');

const dialog = Electron.dialog;
// FIXME: again, load this better
let branding: Branding = {
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

export class ClubWindow {
	browser: Electron.BrowserWindow;
	webviewContents: Electron.webContents | undefined;

	private _title: string;
	public get title() { return this._title };
	public set title(value) { this._title = value; this.browser.setTitle(this._title); };

	private _icon: Electron.nativeImage;
	public get icon() { return this._icon };
	public set icon(value) { this._icon = value; this.browser.setIcon(this._icon); }

	private _maximized: boolean;
	public get maximized() { return this._maximized };
	public set maximized(value) { this._maximized = value; this.sendState(); };

	private _focused: boolean;
	public get focused() { return this._focused };
	public set focused(value) { this._focused = value; this.sendState(); };

	private _fullscreen: boolean;
	public get fullscreen() { return this._fullscreen };
	public set fullscreen(value) { this._fullscreen = value; this.sendState(); };

	private _muted: boolean;
	public get muted() { return this._muted };
	public set muted(value) { this._muted = value; this.sendState(); };

	private _buttons: 'ingame' | 'none';
	public get buttons() { return this._buttons; }
	public set buttons(value) { this._buttons = value; this.sendState(); };

	private _currentPage: PageState;
	public get currentPage() { return this._currentPage };
	public set currentPage(value) { this._currentPage = value; this.sendState(); };

	constructor(
		title: string,
		icon: Electron.nativeImage | string,
		buttons: 'ingame' | 'none',
		currentPage: PageState,
		width: number, height: number
	) {
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
			frame: false, // because custom titlebar :3
			transparent: true, // rounded corners in titlebar
			webPreferences: {
				//preload: path.join(rootDir, 'preload.js'), // for when add preload
				nodeIntegration: true, // for the cool html toolbar
				plugins: true, // needed for flash
				webSecurity: false, // why do we need this?
				webviewTag: true, // instead of iframe
			}
		});

		this.browser.setMenu(null);
		this.clearCache();

		// TODO: replace this with DevTools in the dropdown
		//this.browser.webContents.openDevTools({mode: 'undocked'});

		// Prevent navigating away from frame
		function handleRedirect(event: Electron.Event, url: string) {
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
		this.browser.webContents.on('ipc-message', (event, channel, ...args) => { this.handleIpcMessage(event, channel, args) }); // we have to call it inside an arrow function, or this = EventEmitter and not ClubWindow

		this.browser.loadFile(path.join(rootDir, '/pages/frame.html')).catch(console.error);
		//this.browser.loadURL("https://chobots.world/index").catch(console.error);
		this.browser.webContents.on('did-stop-loading', () => {
			this.updateState();
		});
	}

	handleIpcMessage(event: Electron.Event, channel: string, args: any[]) {
		console.log('handling ipc message, channel ' + channel + ' args ' + args);
		switch(channel) {
			case "window":
				switch(args[0]) {
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
							message: fs.readFileSync(path.join(rootDir, 'ABOUT.txt')).toString()
						});
						break;
					case "navigate":
						this.navigate(args[1]);
						break;
				}
				break;
			case "buttons":
				switch(args[0]) {
					case "ingame":
						switch(args[1]) {
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
				console.log('got container is ready')
				this.webviewContents = Electron.webContents.fromId(args[0]);
				this.webviewContents.on('ipc-message', this.handleIpcMessage);
				break;
			default:
				// this message is not for us
				break;
		}
	}

	clearCache() { return this.browser.webContents.session.clearCache(); }

	navigate(url: string) { return this.currentPage = new PageState(url); }

	sendState() {
		return this.browser.webContents.send('stateUpdate', {
			maximized: this._maximized,
			focused: this._focused,
			fullscreen: this._fullscreen,
			muted: this._muted,
			buttons: this._buttons,
			currentPage: this._currentPage
		} as WindowState); // TODO: get rid of WindowState type?
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

// TODO: (not related to code below) make it so you can autohide the top bar in fullscreen
const { app, ipcRenderer, shell } = require('electron');
const { version } = require('../package.json');
let titlebar;
let layouts = {};
let currentPageId = '';
let contentFrame;
let contentFrameHolder;
let isContentFrameDomReady = false;

window.onload = () => {
	titlebar = document.getElementById('titlebar');
	document.getElementById('Version').innerHTML = "Chobots v" + version;

	layouts.windowButtons = {
		container: document.getElementById('window-buttons'),
		maximize: {
			button: document.getElementById('window-maximize'),
			image: document.querySelector('#window-maximize img')
		} // TODO: the rest of these
	}

	layouts.ingame = {
		container: document.getElementById('button-layout-ingame'),
		hamburger: {
			button: document.getElementById('buttons-ingame-hamburger'),
			image: document.querySelector('#buttons-ingame-hamburger img')
		},
		fullscreen: {
			button: document.getElementById('buttons-ingame-fullscreen'),
			image: document.querySelector('#buttons-ingame-fullscreen img'),
			text: document.querySelector('#buttons-ingame-fullscreen span')
		},
		mute: {
			button: document.getElementById('buttons-ingame-mute'),
			image: document.querySelector('#buttons-ingame-mute img'),
			text: document.querySelector('#buttons-ingame-mute span')
		},
		reload: {
			button: document.getElementById('buttons-ingame-reload'),
			image: document.querySelector('#buttons-ingame-reload img'),
			text: document.querySelector('#buttons-ingame-reload span')
		}
	}

	contentFrame = document.getElementById('content-iframe');
	contentFrameHolder = document.getElementById('content')

	contentFrame.addEventListener('console-message', (e) => {
		console.log(`[from content frame] ln${e.line} lv${e.level} src ${e.sourceId} ${e.message}`);
	});

	contentFrame.addEventListener('dom-ready', (e) => {
		if (!isContentFrameDomReady) ipcRenderer.send('containerIsReady', contentFrame.getWebContentsId());
		isContentFrameDomReady = true;
	});

	contentFrame.addEventListener('new-window', (event) => {
		shell.openExternal(event.url).catch(console.error);
	});
}

function butt(id) {
	switch (id) {
		// window
		case "window-close":
			ipcRenderer.send('window', 'close');
			break;
		case "window-maximize":
			ipcRenderer.send('window', 'maximize');
			break;
		case "window-minimize":
			ipcRenderer.send('window', 'minimize');
			break;
		case "window-about":
			ipcRenderer.send('window', 'about');
			break;

		// buttons-ingame
		case "buttons-ingame-hamburger":
			alert('hamburger menu not part of the minimum viable product sorry check back in 2 years');
			// TODO: hamburger menu
			break;
		case "buttons-ingame-fullscreen":
			ipcRenderer.send('buttons', 'ingame', 'fullscreen');
			break;
		case "buttons-ingame-mute":
			ipcRenderer.send('buttons', 'ingame', 'mute');
			break;
		case "buttons-ingame-reload":
			ipcRenderer.send('buttons', 'ingame', 'reload');
			break;
		case "chobotsworld":
			ipcRenderer.send('buttons', 'ingame', 'chobotsworld');
			break;
		case "chotopiaus":
			ipcRenderer.send('buttons', 'ingame', 'chotopiaus');
			break;
		case "chobotsca":
			ipcRenderer.send('buttons', 'ingame', 'chobotsca');
			break;
		default:
			alert('Oops! You pressed a button that... doesn\'t exist?');
	}
}

ipcRenderer.on('stateUpdate', (event, newState) => {
	//console.log(newState);
	if ((newState.maximized || newState.fullscreen) && (!titlebar.classList.contains('maximized') || contentFrameHolder.classList.contains('maximized'))) {
		titlebar.classList.add('maximized');
		contentFrameHolder.classList.add('maximized');
	} else if ((!newState.maximized && !newState.fullscreen) && (titlebar.classList.contains('maximized') || contentFrameHolder.classList.contains('maximized'))) {
		titlebar.classList.remove('maximized');
		contentFrameHolder.classList.remove('maximized');
	}

	if (!newState.maximized && !newState.fullscreen) {
		if (newState.focused && titlebar.classList.contains('unfocused')) {
			titlebar.classList.remove('unfocused');
		} else if (!newState.focused && !titlebar.classList.contains('unfocused')) {
			titlebar.classList.add('unfocused');
		}
	} else {
		titlebar.classList.remove('unfocused');
	}

	if (newState.maximized) {
		layouts.windowButtons.maximize.image.src = 'assets/icons/window-restore.png';
	} else {
		layouts.windowButtons.maximize.image.src = 'assets/icons/window-maximize.png';
	}

	if (newState.muted) {
		layouts.ingame.mute.text.innerHTML = 'Unmute';
		layouts.ingame.mute.image.src = 'assets/icons/volume-muted.png';
	} else {
		layouts.ingame.mute.text.innerHTML = 'Mute';
		layouts.ingame.mute.image.src = 'assets/icons/volume-high.png';
	}
	if (isContentFrameDomReady) contentFrame.setAudioMuted(newState.muted);

	if (newState.fullscreen) {
		layouts.ingame.fullscreen.text.innerHTML = 'Exit Fullscreen';
		layouts.ingame.fullscreen.image.src = 'assets/icons/exit-fullscreen.png';
	} else {
		layouts.ingame.fullscreen.text.innerHTML = 'Fullscreen';
		layouts.ingame.fullscreen.image.src = 'assets/icons/go-fullscreen.png';
	}

	// remember to add any new layouts here (each layout switch should make all other layouts display none)
	switch(newState.buttons) {
		case 'ingame':
			layouts.ingame.container.style.display = 'inherit';
			break;
		case 'none':
			layouts.ingame.container.style.display = 'none';
			break;
	}

	if (newState.currentPage.id != currentPageId) {
		contentFrame.src = "about:blank";
		contentFrame.src = newState.currentPage.url;
		currentPageId = newState.currentPage.id;
	}
});

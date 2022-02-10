/*
	xyz.puyo.club, xyz.puyo.club.chotopia
	Copyright (C) 2022, Puyo <hi@puyo.xyz>, all rights reserved.
*/

console.log('script loaded');
const { ipcRenderer, app, dialog } = require('electron');
const os = require('os');

let updaterText; let loadingCircle;

/*ipcRenderer.on('updater', (event, command, text) => {
	console.log('updater event');
	switch(command) {
		case "setText":
			console.log('setText: ' + text);
			updaterText.innerHTML = text;
			break;
		case "hideLoader":
			loadingCircle.style.display = "none";
			break;
	}
});*/

window.onload = () => {
	updaterText = document.getElementById('updaterText');
	loadingCircle = document.getElementById('loadingCircle');
	const rootDir = __dirname.replace(new RegExp('pages$'), '');
	const { version } = require('../package.json');
	let branding = {
		name: 'Chobots',
		iconPath: rootDir + '/pages/assets/icons/icon.png',
		nutsUrl: 'https://choupdate.herokuapp.com'
	};
	updaterText.textContent = 'Setting up...'
	//if (app.isPackaged) { //TODO: make this work
	updaterText.textContent = 'Checking for updates...';
	ipcRenderer.send('updateFinished');
	/*fetch(`${branding.nutsUrl}/update/${os.platform() == 'linux' ? 'linux_appimage' : os.platform()}/${version}`)
		.then(async (response) => {
			let body = await response.text();
			if (response.status == 204) {
				updaterText.textContent = 'Up to date! Starting...';
				setTimeout(() => {
					ipcRenderer.send('updateFinished');
				}, 700);
			} else if (response && response.status == 200) {
				body = JSON.parse(body);
				loadingCircle.remove();
				//<a href="${branding.nutsUrl}/download/${os.platform() == 'linux' ? 'linux_appimage' : os.platform() + '_' + os.arch()}" target="_blank_" class="update-link">
				updaterText.innerHTML = `An update is available!<br />
					<a href="${branding.nutsUrl}/download/${os.platform() == 'linux' ? 'linux_appimage' : os.platform()}" target="_blank_" class="update-link">
						Download ${branding.name} ${body.name}
					</a>
					<div class="update-desc">
						${marked.parse(body.notes)}
					</div>`;
			} else {
				updaterText.textContent = 'Error occurred checking updates. Starting...';
				setTimeout(() => {
					ipcRenderer.send('dialog', {
						icon: branding.iconPath,
						message: 'An error occurred checking for updates.\nIt wasn\'t *that* bad, so the client will start anyways.',
						type: 'warning',
						title: branding.name + ' error'
					});
					ipcRenderer.send('updateFinished');
				}, 700);

			}
		}).catch((err) => {
		ipcRenderer.send('dialog', {
			icon: branding.iconPath,
			message: 'An error occurred checking for updates:\n' + err,
			type: 'error',
			title: branding.name + ' crashed'
		});
		ipcRenderer.send('window', 'close');
		return console.error(err);
	});*/
	/*} else {
		updaterText.textContent = 'Skipping update (not packaged)';
		setTimeout(() => {
			ipcRenderer.send('updateFinished');
		}, 15000);
	}*/
} // FIXME: we do the update here because i was too dumb to realize mainWindow.webContents.send() doesnt send to the webview

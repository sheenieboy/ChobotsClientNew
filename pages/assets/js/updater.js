const { ipcRenderer, app, dialog } = require('electron');
const os = require('os');

let updaterText; let loadingCircle;

ipcRenderer.on('updater', function(event, text) {
	updaterText = document.getElementById('updaterText');
	console.log('setText: ' + text);
	updaterText.innerHTML = text;
});
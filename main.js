const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const url = require('url');
const path = require('path');

let win;

function createWindow(){
	
	win = new BrowserWindow({
		width  : 1280,
		height : 720,
		icon: __dirname + '/icon/icon.ico',
		webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
	});
	
	win.loadFile('app/index.html')
	
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
	  // Send the command line arguments to the renderer
	  win.webContents.send('open-file', commandLine);
    }
  })

  app.whenReady().then(function(){
	createWindow();
	
	ipcMain.on('getFilePath-message', (event, options = {}) => {
		dialog.showSaveDialog(options).then(function(file){
			event.returnValue = file;
		});
	});
	
	ipcMain.on('openFile-message', (event, options = {}) => {
		dialog.showOpenDialog(options).then(function(file){
			event.returnValue = file;
		});
	});
	
	ipcMain.on('confirmation-message', (event, arg) => {
		var response = dialog.showMessageBoxSync(null, {
			type: 'question',
			buttons: ['Yes', 'No'],
			title: arg.title,
			message: arg.message
		});
		event.returnValue = response;
	});
	ipcMain.on('alert-message', (event, message) => {
		var response = dialog.showMessageBoxSync(null, {
			type: 'question',
			buttons: ['OK'],
			title: 'AB2E Editor 1.0.0',
			message: message
		});
		event.returnValue = response;
	});

	ipcMain.on('get-args', (event) => {
		event.returnValue = process.argv;
	});

  });
}



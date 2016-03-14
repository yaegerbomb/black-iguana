'use strict';

const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const Jimp = require("jimp");
const screenshot = require("screenshot");

ipcMain.on('crop', function (event, args) {
    console.log(args);
    Jimp.read(__dirname + "/../node_modules/screenshot/screenshot" + args.monitor + ".jpg", function (err, image) {
		var width = args.endingPoint.x - args.startingPoint.x;
		var height = args.endingPoint.y - args.startingPoint.y;
        image.crop( args.startingPoint.x, args.startingPoint.y, width, height);
		image.write(__dirname + "/../images/screenshotCropped.jpg", function(){
			console.log("cropped");
			
			for(var i = 0; i <  mainWindow.length; i++){
				if(mainWindow[i]){
					mainWindow[i].close("test");
					mainWindow[i] = null;
				}
			}
			
			mainWindow = [];
			Jimp.read(__dirname + "/../images/screenshotCropped.jpg", function (err, croppedimage) {
				croppedimage.width = width;
				croppedimage.height = height;
				
				//create window on monitor we cropped from
				var displays = electron.screen.getAllDisplays();
				for (var i in displays) {
					console.log(displays[i]);
					console.log(croppedimage.width);
					console.log(croppedimage.height);
					if(i == args.monitor){
						// Create the browser window with the size of the desktop screen  
						mainWindow.push(new BrowserWindow({minWidth: croppedimage.width + 50, minHeight: croppedimage.height + 150, x: displays[i].bounds.x, 
											y: displays[i].bounds.y, useContentSize: true, center: true, frame: true }));

						mainWindow[mainWindow.length - 1].loadURL('file://' + __dirname + '/../html/screenshot.html');
					}
				}
			});
			
		} );
    });

	
});

const app = electron.app;  // Module to control application life.
app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');

const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = [];

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform != 'darwin') {
        //app.quit();
    //}
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
	screenshot.snap();
    var displays = electron.screen.getAllDisplays();
    for (var i in displays) {

        // Create the browser window with the size of the desktop screen  
        mainWindow.push(new BrowserWindow({ x: displays[i].bounds.x, y: displays[i].bounds.y, fullscreen: true, transparent: true, frame: false }));

        // and load the index.html of the app.
        mainWindow[mainWindow.length - 1].loadURL('file://' + __dirname + '/../html/index.html?monitor=' + i);
    }
});
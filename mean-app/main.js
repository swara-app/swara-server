'use strict';

var debug = require('debug')('swara:main');
var app = require('app');
var BrowserWindow = require('browser-window');
var devHelper = require('./libs/electron/devHelper');
var windowStateKeeper = require('./libs/electron/windowState');
var directoryPickerIPC = require('./libs/electron/directoryPickerIPC');
var mainWindow = null;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width  : 1366,
  height : 768
});

debug('Setting up the app ready handler');
app.on('ready', function () {
  debug('Beginning the electron app ready handler');
  mainWindow = new BrowserWindow({
    x      : mainWindowState.x,
    y      : mainWindowState.y,
    width  : mainWindowState.width,
    height : mainWindowState.height
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  //set up IPC for opening the directory picker from the angular directive
  directoryPickerIPC.setupIPC(mainWindow);

  // load the loading page
  mainWindow.loadUrl('file://' + __dirname + '/bootstrap/index.html');

  devHelper.setDevMenu();
  // mainWindow.openDevTools();

  mainWindow.on('close', function () {
    var shutdownHandler = require('./bootstrap/shutdown');
    shutdownHandler.shutdown();
    mainWindowState.saveState(mainWindow);
  });

  // navigate to the meanjs app
  debug('Setting the startupHandler.ready handler to navigate to the meanjs app');
  var startupHandler = require('./bootstrap/startup.js');
  startupHandler.ready(function () {
    debug('Within the server ready callback - about to redirect to the home page');
    mainWindow.loadUrl('http://localhost:3000/');
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // get the logs directory from the electron supplied user data folder
  var logsDirectory = app.getPath('userData') + '/swara-server-logs/';
  debug('Logs Directory: %s', logsDirectory);

  // Start the server passing in the logs directory
  debug('Starting the MEAN app');
  startupHandler.start(logsDirectory);

  debug('Finishing the elctron app ready handler');
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

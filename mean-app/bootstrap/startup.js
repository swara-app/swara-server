'use strict';

var debug = require('debug')('swara:startup'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  spawnhelper = require('../libs/spawnhelper'),
  stdout = null,
  serverPid,
  serverReady = false,
  serverReadyMarker = 'MEAN.JS application started on port ',
  serverReadyPollerInterval,
  serverReadyPoller = function (callback) {
    return function () {
      if (stdout) {
        fs.readFile(stdout, {encoding : 'utf8'}, function (err, data) {
          if (err) throw err;
          if (data.indexOf(serverReadyMarker) > -1) {
            debug('Server is ready...');
            clearInterval(serverReadyPollerInterval);
            callback();
          }
        });
      }
    };
  };

debug('Declaring startupHandler object with start and ready handlers...');
var startupHandler = {
  start        : function (logsDirectory) {
    debug('Entered startupHandler:start function');

    // set the logsDirectory property on the global object
    global.logsDirectory = logsDirectory;

    // and then load the app, so as to set the logsDirectory from global.logsDirectory correctly
    var app = require('../app');

    // create the logs directory
    mkdirp.sync(global.logsDirectory);

    // initialize the app log if it does not exist
    var appLogFile = app.locals.appLogFile;
    debug('App Log File: %s', appLogFile);
    if (!fs.existsSync(appLogFile)) {
      fs.writeFileSync(appLogFile, '');
    }

    // initialize the library log if it does not exist
    var libraryLogFile = app.locals.libraryLogFile;
    debug('Library Log File: %s', libraryLogFile);
    if (!fs.existsSync(libraryLogFile)) {
      fs.writeFileSync(libraryLogFile, '');
    }

    // start the server process
    spawnhelper.spawn({
      name          : 'Mean.JS Server',
      command       : __dirname + '/daemon',
      debugPort     : 5858,
      logFile       : appLogFile,
      args          : [global.logsDirectory],
      onBeforeSpawn : function () {
        debug('About to start the server');
      },
      onAfterSpawn  : function (server) {
        serverPid = server.pid;
        stdout = appLogFile;
      }
    });
  },
  ready        : function (callback) {
    if (serverReady) {
      callback();
    } else {
      serverReadyPollerInterval = setInterval(serverReadyPoller(callback), 100);
    }
  },
  getServerPid : function () {
    return serverPid;
  }
};

module.exports = startupHandler;

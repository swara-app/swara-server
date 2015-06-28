'use strict';

var debug = require('debug')('swara:startup'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  app = require('../app'),
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

    // Set the logs directory path into the app
    app.set('logsDirectory', logsDirectory);

    // initialize the library log if it does not exist
    var libraryLogFile = logsDirectory + app.get('libraryLogFile');
    if (!fs.existsSync(libraryLogFile)) {
      mkdirp.sync(logsDirectory);
      fs.writeFileSync(libraryLogFile, '');
    }

    var appLogFile = app.get('appLogFile');

    // start the server process
    spawnhelper.spawn({
      name          : 'Mean.JS Server',
      command       : 'bootstrap/daemon',
      debugPort     : 5858,
      logFile       : appLogFile,
      onBeforeSpawn : function () {
        debug('About to start the server');
      },
      onAfterSpawn  : function (server) {
        serverPid = server.pid;
        stdout = logsDirectory + appLogFile;
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

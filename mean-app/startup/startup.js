'use strict';

var debug = require('debug')('swara:startup'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  app = require('../server'),
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

debug('Declaring daemon object with start and ready handlers...');
var daemon = {
  start        : function () {
    debug('Entered daemon:start function');

    var logDir = 'logs/';

    // initialize the library log if it does not exist
    var libraryLogFile = logDir + app.libraryLogFile;
    if (!fs.existsSync(libraryLogFile)) {
      mkdirp.sync(logDir);
      fs.writeFileSync(libraryLogFile, '');
    }

    // start the server process
    spawnhelper.spawn({
      name          : 'Mean.JS Server',
      command       : 'startup/daemon',
      debugPort     : 5858,
      logFile       : app.appLogFile,
      onBeforeSpawn : function () {
        debug('About to start the server');
      },
      onAfterSpawn  : function (server) {
        serverPid = server.pid;
        stdout = logDir + app.appLogFile;
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

module.exports = daemon;

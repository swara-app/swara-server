'use strict';

var debug = require('debug')('swara:startup'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  cpHelper = require('../libs/childProcessHelper'),
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
  start        : function (userDataDirectory) {
    debug('Entered startupHandler:start function');

    // set the userDataDirectory property on the global object
    global.userDataDirectory = userDataDirectory;

    // and then load the app, so as to set the userDataDirectory from global.userDataDirectory correctly
    var app = require('../app');

    // initialize the app log if it does not exist
    var appLogFile = app.locals.appLogFile;

    // create the logs directory
    mkdirp.sync(path.dirname(appLogFile));

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
    cpHelper.spawn({
      name          : 'Mean.JS Server',
      command       : __dirname + '/daemon',
      debugPort     : 5858,
      logFile       : appLogFile,
      args          : [global.userDataDirectory],
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

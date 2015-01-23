'use strict';

var debug = require('debug')('swara:daemon'),
  fs = require('fs'),
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
        if (app.debugMode) {
          debug('Server is being debugged and will be ready shortly...');
          setTimeout(function () {
            callback();
          }, 3000);
          clearInterval(serverReadyPollerInterval);
        } else {
          fs.readFile(stdout, {encoding : 'utf8'}, function (err, data) {
            if (err) throw err;
            if (data.indexOf(serverReadyMarker) > -1) {
              debug('Server is ready...');
              clearInterval(serverReadyPollerInterval);
              callback();
            }
          });
        }
      }
    };
  };

debug('Declaring daemon:start function');
var daemon = {
  start        : function () {
    debug('Entered daemon:start function');

    var serverLogFile = 'swara-server.log';
    // start the server process
    spawnhelper.spawn({
      name          : 'Mean.JS Server',
      command       : 'startup/daemon',
      debugPort     : 5858,
      logFile       : serverLogFile,
      onBeforeSpawn : function () {
        debug('About to start the server');
      },
      onAfterSpawn  : function (server) {
        serverPid = server.pid;
        stdout = 'logs/' + serverLogFile;
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

daemon.start();

module.exports = daemon;

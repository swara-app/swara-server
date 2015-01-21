'use strict';

var debug = require('debug')('swara:daemon'),
  fs = require('fs'),
  spawnhelper = require('../libs/spwanhelper'),
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

debug('Declaring daemon:start function');
var daemon = {
  start        : function () {
    debug('Entered daemon:start function');

    // start the server process
    var outputDirectory = 'logs';
    spawnhelper.spawn({
      name          : 'Mean.JS Server',
      outputDir     : outputDirectory,
      command       : 'startup/daemon',
      onBeforeSpawn : function () {
        debug('About to start the server');
      },
      onAfterSpawn  : function (server) {
        serverPid = server.pid;
        stdout = outputDirectory + '/stdout.log';
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

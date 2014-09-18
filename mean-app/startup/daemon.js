'use strict';

var debug = require('debug')('swara:daemon'),
    fs = require('fs'),
    stdout,
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
  start : function () {
    debug('Entered daemon:start function');
    var spawn = require('child_process').spawn,
        util = require('util'),
        mkdirp = require('mkdirp');

    // start the server process
    debug('Starting the server');
    var outputDirectory = 'logs';
    mkdirp(outputDirectory, function (err) {
      if (err) {
        console.error(err);
      }
      var stdoutfile = fs.openSync(outputDirectory + '/stdout.log', 'w+');
      var stderrfile = fs.openSync(outputDirectory + '/stderr.log', 'w+');

      var startMarker = util.format('Session started at %s\n--------------\n', new Date().toUTCString());
      fs.writeSync(stdoutfile, startMarker);
      fs.writeSync(stderrfile, startMarker);

      debug('Starting the server...');
      var server = spawn('node', ['startup/daemon'], {
        env   : process.env,
        stdio : ['ignore', stdoutfile, stderrfile]
      });

      stdout = outputDirectory + '/stdout.log';
    });
  },
  ready : function (callback) {
    if (serverReady) {
      callback();
    } else {
      serverReadyPollerInterval = setInterval(serverReadyPoller(callback), 100);
    }
  }
};

daemon.start();

module.exports = daemon;

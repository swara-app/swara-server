'use strict';

var debug = require('debug')('swara:daemon');

debug('Declaring daemon:start function');
var daemon = {
  start : function () {
    debug('Entered daemon:start function');
    var spawn = require('child_process').spawn,
        fs = require('fs'),
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

    });
  }
};

daemon.start();

module.exports = daemon;

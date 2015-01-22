'use strict';

var debug = require('debug')('swara:spawnhelper');

module.exports = {

  spawn : function (options) {

    var fs = require('fs'),
      _ = require('lodash'),
      moment = require('moment'),
      spawn = require('child_process').spawn,
      util = require('util'),
      mkdirp = require('mkdirp'),
      app = require('../server');

    var defaults = {
      name          : '',
      outputDir     : 'logs',
      command       : '',
      debugPort     : app.getNextDebugPort(),
      stdoutFile    : 'stdout.log',
      stderrFile    : 'stderr.log',
      onBeforeSpawn : function () {
      },
      onAfterSpawn  : function (/* spawnedProcess */) {
      }
    };

    var settings = _.defaults(options, defaults);

    if (!settings.name || !settings.command) {
      throw new Error('name or command is empty');
    }

    mkdirp(settings.outputDir, function (err) {
      if (err) {
        console.error(err);
      }
      var stdoutfile = fs.openSync(settings.outputDir + '/' + settings.stdoutFile, 'w+');
      var stderrfile = fs.openSync(settings.outputDir + '/' + settings.stderrFile, 'w+');

      var startMarker = util.format('started the process named %s at %s\n--------------\n', settings.name, moment());
      fs.writeSync(stdoutfile, startMarker);
      fs.writeSync(stderrfile, startMarker);

      if (typeof(settings.onBeforeSpawn) === 'function') {
        settings.onBeforeSpawn();
      }

      if (app.debugMode) {
        stdoutfile = process.stdout;
        stderrfile = process.stderr;
      }

      debug('Starting the spawnedProcess named %s...', settings.name);
      var spawnedProcess = spawn('node', ['--debug=' + settings.debugPort, settings.command], {
        env   : process.env,
        stdio : ['pipe', stdoutfile, stderrfile]
      });

      if (typeof(settings.onAfterSpawn) === 'function') {
        settings.onAfterSpawn(spawnedProcess);
      }
    });

  }
};

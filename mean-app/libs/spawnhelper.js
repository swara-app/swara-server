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
      logFile       : '',
      logFileMode   : 'w+',
      onBeforeSpawn : function () {
      },
      onAfterSpawn  : function (/* spawnedProcess */) {
      }
    };

    var settings = _.defaults(options, defaults);

    if (!settings.name || !settings.command || !settings.logFile) {
      throw new Error('name, command and logFile cannot be empty');
    }

    mkdirp(settings.outputDir, function (err) {
      if (err) {
        console.error(err);
      }

      var stdout, stderr;

      console.log('DEBUG Mode: %s', app.debugMode);
      if (app.debugMode) {
        stdout = process.stdout;
        stderr = process.stderr;
      } else {
        stderr = stdout = fs.openSync(settings.outputDir + '/' + settings.logFile, settings.logFileMode);

        var startMarker = util.format('%sspawning process named `%s` - (%s)\n--------------\n',
          settings.logFileMode === 'w+' ? '' : '\n\n**** SEPARATOR ****\n\n\n',
          settings.name, moment());
        fs.writeSync(stdout, startMarker);
      }

      if (typeof(settings.onBeforeSpawn) === 'function') {
        settings.onBeforeSpawn();
      }

      debug('Starting the spawnedProcess named %s...', settings.name);
      var spawnedProcess = spawn('node', ['--debug=' + settings.debugPort, settings.command], {
        env   : process.env,
        stdio : ['pipe', stdout, stderr]
      });

      if (typeof(settings.onAfterSpawn) === 'function') {
        settings.onAfterSpawn(spawnedProcess);
      }
    });

  }
};

'use strict';

var debug = require('debug')('swara:childProcessHelper');

module.exports = {

  spawn : function (options) {

    var fs = require('fs'),
      _ = require('lodash'),
      moment = require('moment'),
      domain = require('domain').create(),
      fork = require('child_process').fork,
      util = require('util'),
      app = require('../app');

    var defaults = {
      name          : '',
      command       : '',
      debugPort     : app.getNextDebugPort(),
      logFile       : '',
      args          : [],
      onBeforeSpawn : function () {
      },
      onAfterSpawn  : function (/* spawnedProcess */) {
      }
    };

    var settings = _.defaults(options, defaults);

    if (!settings.name || !settings.command || !settings.logFile) {
      throw new Error('name, command and logFile cannot be empty');
    }

    domain.on('error', function (error) {
      console.error('!!ERROR: %j', error);
    });

    domain.run(function () {

      var stdout, stderr;

      var logFd = fs.openSync(settings.logFile, 'w+');

      var startMarker = util.format('Beginning process <strong>%s</strong> - (%s)\n--------------\n',
        settings.name, moment());
      fs.writeSync(logFd, startMarker);

      if (typeof(settings.onBeforeSpawn) === 'function') {
        settings.onBeforeSpawn();
      }

      stderr = stdout = fs.createWriteStream(null, {fd : logFd, encoding : 'utf8'});

      debug('Starting the spawnedProcess named %s...', settings.name);
      var args = ['--debug=' + settings.debugPort].concat(settings.args);
      var spawnedProcess = fork(settings.command, args, {
        env    : process.env,
        silent : true
      });

      spawnedProcess.stderr.pipe(stderr);
      spawnedProcess.stdout.pipe(stdout);

      if (typeof(settings.onAfterSpawn) === 'function') {
        settings.onAfterSpawn(spawnedProcess);
      }

    });

  }

};

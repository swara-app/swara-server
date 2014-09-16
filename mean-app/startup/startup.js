'use strict';

var debug = require('debug')('swara:bootstrap');

var run = function () {
  debug('Entered bootstrap function');
  var gui = require('nw.gui'), // Load native UI library
      win = require('nw.gui').Window.get(), // Get the current window
      platform = require('os').platform(),
      spawn = require('child_process').spawn,
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

    var server = spawn('node', ['startup/www.js'], {
      env   : process.env,
      stdio : ['ignore', stdoutfile, stderrfile]
    });

  });

  // attach menu
  if (platform === 'darwin') {
    debug('attaching the menu on mac');
    var nativeMenuBar = new gui.Menu({ type : 'menubar' });
    nativeMenuBar.createMacBuiltin('Swara Server', {
      hideEdit   : true,
      hideWindow : true
    });
    win.menu = nativeMenuBar;
  }

  // open Dev Tools
  // win.showDevTools();

  // navigate to the meanjs app
  setTimeout(function () {
    debug('navigating to the meanjs app');
    window.location.assign('http://localhost:3000/');
  }, 1000);
};

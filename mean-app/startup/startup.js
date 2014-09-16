'use strict';

var debug = require('debug')('swara:bootstrap');

var run = function () {
  debug('Entered bootstrap function');
  var nw = {
    gui      : require('nw.gui'), // Load native UI library
    win      : require('nw.gui').Window.get(), // Get the current window
    platform : require('os').platform(),
    spawn    : require('child_process').spawn,
    exec     : require('child_process').exec,
    fs       : require('fs'),
    path     : require('path'),
    mkdirp   : require('mkdirp')
  };

  // start the server process
  debug('Starting the server');
  var outputDirectory = 'logs';
  nw.mkdirp(outputDirectory, function (err) {
    if (err) {
      console.error(err);
    }
    var server = nw.spawn('node', ['www.js']);

    var stdoutfile = nw.fs.createWriteStream(outputDirectory + '/stdout');
    var stderrfile = nw.fs.createWriteStream(outputDirectory + '/stderr');

    server.stdout.on('data', function (data) {
      stdoutfile.write(data);
    });
    server.stderr.on('data', function (data) {
      stderrfile.write(data);
    });
  });

  // attach menu
  if (nw.platform === 'darwin') {
    debug('attaching the menu on mac');
    var nativeMenuBar = new nw.gui.Menu({ type : 'menubar' });
    nativeMenuBar.createMacBuiltin('Swara Server', {
      hideEdit   : true,
      hideWindow : true
    });
    nw.win.menu = nativeMenuBar;
  }

  // open Dev Tools
  nw.win.showDevTools();

  console.log(nw);

  // navigate to the meanjs app
  setTimeout(function () {
    window.location.assign('http://localhost:3000/');
  }, 1000);
};


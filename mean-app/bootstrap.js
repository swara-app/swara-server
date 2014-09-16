'use strict';

var debug = require('debug')('bootstrap');

var bootstrap = function () {
  debug('Entered bootstrap function')
  var nw = {
    gui      : require('nw.gui'), // Load native UI library
    win      : require('nw.gui').Window.get(), // Get the current window
    platform : require('os').platform(),
    spawn    : require('child_process').spawn,
    exec     : require('child_process').exec,
    fs       : require('fs'),
    path     : require('path')
  };

  // start the server process
  //nw.spawn('node', ['./bin/www']);

  // attach menu
  if (nw.platform !== 'win32') {
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


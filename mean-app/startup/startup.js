/*jshint unused:false */
'use strict';

var run = function () {
  var debug = require('debug')('swara:bootstrap');
  debug('Entered bootstrap function');
  var gui = require('nw.gui'), // Load native UI library
    win = require('nw.gui').Window.get(), // Get the current window
    platform = require('os').platform(),
    daemon = require('./daemon.js');


  // attach mac menu
  if (platform === 'darwin') {
    debug('Attaching the Mac menu');
    var nativeMenuBar = new gui.Menu({type : 'menubar'});
    nativeMenuBar.createMacBuiltin('Swara Server', {
      hideEdit   : true,
      hideWindow : true
    });
    win.menu = nativeMenuBar;
  }

  // open Dev Tools
  // win.showDevTools();

  // navigate to the meanjs app
  debug('Setting the daemon.ready handler to navigate to the meanjs app');
  daemon.ready(function () {
    window.location.assign('http://localhost:3000/');
  });

  // Start the server
  daemon.start();
};

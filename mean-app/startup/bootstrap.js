'use strict';

var debug = require('debug')('swara:bootstrap');

var run = function () {
  debug('Entered bootstrap function');
  var gui = require('nw.gui'), // Load native UI library
      win = require('nw.gui').Window.get(), // Get the current window
      platform = require('os').platform(),
      kill = require('tree-kill'),
      daemon = require('./daemon.js');

  // attach mac menu
  if (platform === 'darwin') {
    debug('Attaching the Mac menu');
    var nativeMenuBar = new gui.Menu({ type : 'menubar' });
    nativeMenuBar.createMacBuiltin('Swara Server', {
      hideEdit   : true,
      hideWindow : true
    });
    win.menu = nativeMenuBar;
  }

  // open Dev Tools
  // win.showDevTools();

  // set up the shutdown of the server
  // TODO: Doesn't work now on Mac
  debug('Setting up the eventhandler for server teardown');
  win.on('close', function () {
    debug('Entered the close event');
    this.hide();
    var pid = process.pid;
    debug('About to issue a tree-kill on the process id: ' + pid);
    kill(pid);
    this.close(true);
  });

  // navigate to the meanjs app
  //setTimeout(function () {
  debug('Setting the daemon.ready handler to navigate to the meanjs app');
  daemon.ready(function () {
    window.location.assign('http://localhost:3000/');
  });
  //}, 1000);
};

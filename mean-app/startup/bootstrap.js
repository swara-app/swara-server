'use strict';

var debug = require('debug')('swara:bootstrap');

var run = function () {
  debug('Entered bootstrap function');
  var gui = require('nw.gui'), // Load native UI library
      win = require('nw.gui').Window.get(), // Get the current window
      platform = require('os').platform(),
      kill = require('tree-kill');

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
  // start TODO
  // put this in an infinite loop and keep checking the entry
  // 'MEAN.JS application started on port 3000' to appear on stdout.log
  // and then navigate to localhost
  // end TODO
  setTimeout(function () {
    debug('Navigating to the meanjs app');
    window.location.assign('http://localhost:3000/');
  }, 1000);
};

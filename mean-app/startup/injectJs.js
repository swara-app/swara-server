'use strict';

var debug = require('debug')('swara:injectJs'),
  win = require('nw.gui').Window.get(),
  daemon = require('./daemon.js');

// setting up the shutdown of the server as window.close eventhandler
debug('Setting up the eventhandler for server teardown');
win.on('close', function () {
  debug('Entered the close event');
  // First hide the window
  this.hide();

  // kill express server and its child processes
  debug('Killing the server process..');
  process.kill(daemon.getServerPid(), 'SIGKILL');

  // exit the main nw process
  setTimeout(function () {
    debug('Exiting main process..');
    process.exit(0);
  }, 100);

  debug('Closing the window...');
  this.close(true);
});

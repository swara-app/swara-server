'use strict';

var debug = require('debug')('swara:injectJs'),
  win = require('nw.gui').Window.get(),
  daemon = require('./daemon.js'),
  kill = require('tree-kill');

function killProcessTree(pid) {
  debug('About to issue a tree-kill on the process id: ' + pid);
  kill(pid, 'SIGTERM');
}

// setting up the shutdown of the server as window.close eventhandler
// TODO: This works most of the times, but is still hit or miss!
// TODO: Need to work on a proper server shutdown
debug('Setting up the eventhandler for server teardown');
win.on('close', function () {
  debug('Entered the close event');
  // First hide the window
  this.hide();

  // kill the server child process
  killProcessTree(daemon.getServerPid());

  // kill the main process
  killProcessTree(process.pid);

  debug('Closing the window...');
  this.close(true);
});

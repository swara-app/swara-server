'use strict';

var debug = require('debug')('swara:injectJs'),
  win = require('nw.gui').Window.get(),
  daemon = require('./daemon.js'),
  kill = require('tree-kill'),
  isWindows = process.platform === 'win32';

function killProcessTree(pid) {
  debug('About to issue a tree-kill on the process id: ' + pid);
  kill(pid, 'SIGTERM');
}

// setting up the shutdown of the server as window.close eventhandler
debug('Setting up the eventhandler for server teardown');
win.on('close', function () {
  debug('Entered the close event');
  // First hide the window
  this.hide();

  if (isWindows) {  // use the tree-kill package on windows

    // kill the server child process
    killProcessTree(daemon.getServerPid());

    // kill the main process
    killProcessTree(process.pid);

  } else {  // on non-windows os-es use process.kill and process.exit

    // kill express server and its child processes
    debug('Killing the server process..');
    process.kill(daemon.getServerPid(), 'SIGKILL');

    // exit the main nw process
    setTimeout(function () {
      debug('Exiting main process..');
      process.exit(0);
    }, 100);

  }

  debug('Closing the window...');
  this.close(true);
});

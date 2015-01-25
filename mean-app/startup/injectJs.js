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

  var serverPid = daemon.getServerPid();
  var nwPid = process.pid;
  if (isWindows) {  // use the tree-kill package on windows

    // kill the server child process
    killProcessTree(serverPid);

    // kill the main process
    killProcessTree(nwPid);

  } else {  // on non-windows os-es use process.kill and process.exit

    // kill express server and its child processes
    debug('Killing the server process: %s', serverPid);
    process.kill(serverPid, 'SIGKILL');

    // exit the main nw process
    debug('Exiting main process: %s', nwPid);
    setTimeout(function () {
      process.exit(0);
    }, 100);

  }

  debug('Closing the window...');
  this.close(true);
});

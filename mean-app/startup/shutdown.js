'use strict';

var debug = require('debug')('swara:shutdown'),
  daemon = require('./startup'),
  kill = require('tree-kill'),
  isWindows = process.platform === 'win32';

function killProcessTree(pid) {
  debug('About to issue a tree-kill on the process id: ' + pid);
  kill(pid, 'SIGTERM');
}

// setting up the shutdown of the server as window.close eventhandler
debug('Setting up the eventhandler for server teardown');
module.exports = {
  shutdown : function () {
    debug('Entered the close event');

    var serverPid = daemon.getServerPid();
    var electronPid = process.pid;
    if (isWindows) {  // use the tree-kill package on windows

      // kill the server child process
      killProcessTree(serverPid);

      // kill the main process
      killProcessTree(electronPid);

    } else {  // on non-windows os-es use process.kill and process.exit

      // kill express server and its child processes
      debug('Killing the server process: %s', serverPid);
      process.kill(serverPid, 'SIGKILL');

      // exit the main nw process
      debug('Exiting main process: %s', electronPid);
      setTimeout(function () {
        process.exit(0);
      }, 100);

    }

  }
};

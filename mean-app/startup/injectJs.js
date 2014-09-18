'use strict';

var debug = require('debug')('swara:injectJs'),
    win = require('nw.gui').Window.get(),
    kill = require('tree-kill');

// setting up the shutdown of the server as window.close eventhandler
debug('Setting up the eventhandler for server teardown');
win.on('close', function () {
    debug('Entered the close event');
    this.hide();
    var pid = process.pid;
    debug('About to issue a tree-kill on the process id: ' + pid);
    kill(pid);
    this.close(true);
});



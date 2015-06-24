'use strict';

var debug = require('debug')('swara:directoryPickerIPC'),
  ipc = require('ipc'),
  dialogHelper = require('./dialogHelper');

debug('Setting up directoryPickerIPC with the setupIPC function');
var directoryPickerIPC = {
  setupIPC : function (browserWindow) {
    ipc.on('open-directory-picker', function (event, arg) {
      debug('Within the directory-picker event in main process IPC');
      dialogHelper.showDirectoryPickerDialog(browserWindow, arg.title, arg.defaultPath, function (paths) {
        debug('within the callback - %j', paths);
        if (paths && paths.length === 1) {
          event.sender.send('directory-picker-closed', paths[0]);
        }
      });
    });
  }
};

module.exports = directoryPickerIPC;

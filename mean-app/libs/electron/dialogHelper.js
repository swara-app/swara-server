'use strict';

var debug = require('debug')('swara:dialogHelper'),
  dialog = require('dialog');

var dialogHelper = {
  showDirectoryPickerDialog: function(browserWindow, title, defaultPath, callback) {
    dialog.showOpenDialog(browserWindow, {
      title: title,
      defaultPath: defaultPath,
      properties: ['openDirectory', 'createDirectory']
    }, callback);
  }
};

module.exports = dialogHelper;

'use strict';

var debug = require('debug')('swara:walker'),
  walk = require('walk');

var walker = {
  walkFolder : function (folder, fileHandler, endHandler, errorHandler) {
    debug('Inside walker.walkFolder for "%s"', folder.path);
    var walker = walk.walk(folder.path, {
      followLinks : false, filters : ['Temp', '_Temp']
    });

    debug('Setting up on file event handler for the walker');
    walker.on('file', fileHandler);

    debug('Setting up on end event handler for the walker');
    walker.on('end', endHandler);

    debug('Setting up on error event handler for the walker');
    walker.on('errors', errorHandler);
  }
};

module.exports = walker;

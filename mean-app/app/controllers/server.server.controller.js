'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server-controller:server'),
  fs = require('fs'),
  es = require('event-stream'),
  Convert = require('ansi-to-html'),
  config = require('../../config/config'),
  convert = new Convert({fg : '#333', bg : 'transparent'});

var logsDirectory = 'logs';
var colorize = function (line) {
  return convert.toHtml(line);
};

var setupLibraryLogTail = function (socketio, logFileName) {
  debug('Inside server.server-controller.setupLibraryLogTail:' + logFileName);

  var logStream = fs.createReadStream(logsDirectory + '/' + config[logFileName])
    .pipe(es.split())
    .pipe(es.map(function (line) {
      // pause the readstream
      logStream.pause();

      (function () {
        // process line here and call logStream.resume() when rdy
        socketio.sockets.emit(logFileName + '.tail.line', colorize(line));
        // resume the readstream
        logStream.resume();
      })();
    })
      .on('error', function (error) {
        console.log('Error while reading file.');
        socketio.sockets.emit(logFileName + '.tail.error', error);
      })
      .on('end', function () {
        console.log('Read entirefile.');
        socketio.sockets.emit(logFileName + '.tail.ended', {});
      })
  );

};

/**
 * Show the server information
 */
exports.view = function (req, res) {
  debug('Inside server.server-controller.view ');
  var app = req.app;
  var server = {
    title : app.locals.title,
    env   : app.get('env'),
    port  : config.port,
    pid   : process.pid,
    db    : config.db
  };

  var socketio = req.app.get('socketio');

  setupLibraryLogTail(socketio, 'appLogFile');
  setupLibraryLogTail(socketio, 'libraryLogFile');

  res.json(server);
};


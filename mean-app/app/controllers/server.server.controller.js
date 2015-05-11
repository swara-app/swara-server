'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server-controller:server'),
  fs = require('fs'),
  es = require('event-stream'),
  async = require('async'),
  Convert = require('ansi-to-html'),
  config = require('../../config/config'),
  convert = new Convert({fg : '#333', bg : 'transparent'});

var logsDirectory = 'logs';
var MAX_LOG_SIZE = 10000;

var readAsync = function (file, callback) {
  fs.readFile(file, 'utf8', callback);
};

var colorize = function (line) {
  return convert.toHtml(line);
};

var setupLibraryLogTail = function (socketio, logFileName, availableLines) {
  debug('Inside server.server-controller.setupLibraryLogTail:' + logFileName);

  var lineCounter = 0;
  // TODO: createReadStream suddenly stops at the end of scanning for some reason
  var logStream = fs.createReadStream(logsDirectory + '/' + config[logFileName])
    .pipe(es.split())
    .pipe(es.map(function (line) {
      lineCounter++;

      // pause the readstream
      logStream.pause();

      (function () {
        // process line here and call logStream.resume() when rdy
        if (lineCounter > availableLines && line) {
          socketio.sockets.emit(logFileName + '.tail.line', colorize(line));
        }
        // resume the readstream
        logStream.resume();
      })();
    })
      .on('error', function (error) {
        console.log('Error while reading file.');
        socketio.sockets.emit(logFileName + '.tail.error', error);
      })
      .on('end', function () {
        console.log('Read entire file.');
        socketio.sockets.emit(logFileName + '.tail.ended', {});
      })
  );
};

var limitToMaximumSize = function (logLines) {
  var size = logLines.length;

  // trim the empty line at the end
  if (logLines[logLines.length - 1].length === 0) {
    logLines.splice(-1, 1);
    size--;
  }

  // limit to maximum size
  if (size > MAX_LOG_SIZE) {
    logLines.splice(0, size - MAX_LOG_SIZE);
  }

  return {size : size, lines : logLines};
};

/**
 * Show the server information
 */
exports.view = function (req, res) {
  debug('Inside server.server-controller.view ');
  var app = req.app;
  var server = {
    title      : app.locals.title,
    env        : app.get('env'),
    port       : config.port,
    pid        : process.pid,
    db         : config.db,
    maxLogSize : MAX_LOG_SIZE
  };
  async.map([
    logsDirectory + '/' + config.appLogFile,
    logsDirectory + '/' + config.libraryLogFile
  ], readAsync, function (err, results) {
    debug('Read both log files asynchronously');
    if (err) {
      return res.status(400).send(err);
    } else {

      var appLogFile = limitToMaximumSize(results[0].split('\n').map(colorize));
      server.appLogFileLength = appLogFile.size;
      server.appLogFile = appLogFile.lines;

      var libraryLogFile = limitToMaximumSize(results[1].split('\n').map(colorize));
      server.libraryLogFileLength = libraryLogFile.size;
      server.libraryLogFile = libraryLogFile.lines;

      res.json(server);
    }
  });
};

exports.logs = function (req, res) {
  var availableLines = req.body;
  var socketio = req.app.get('socketio');

  setupLibraryLogTail(socketio, 'appLogFile', availableLines.appLogFile);
  setupLibraryLogTail(socketio, 'libraryLogFile', availableLines.libraryLogFile);

  res.send('WebSockets set up successfully');
};



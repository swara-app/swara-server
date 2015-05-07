'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server-controller:server'),
  fs = require('fs'),
  async = require('async'),
  config = require('../../config/config'),
  Convert = require('ansi-to-html'),
  convert = new Convert({fg : '#333', bg : 'transparent'});

var MAX_LOG_SIZE = 10000;

var readAsync = function (file, callback) {
  fs.readFile(file, 'utf8', callback);
};

var colorize = function (line) {
  return convert.toHtml(line);
};

var limitToMaximumSize = function (logLines) {
  var size = logLines.length;
  if (size > MAX_LOG_SIZE) {
    logLines.splice(0, size - MAX_LOG_SIZE);
  }
  return logLines;
};
/**
 * Show the server information
 */
exports.view = function (req, res) {
  debug('Inside server.server-controller.view ');
  var app = req.app;
  var logsDirectory = 'logs';
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
      server.appLog = limitToMaximumSize(results[0].split('\n').map(colorize));
      server.libraryLog = limitToMaximumSize(results[1].split('\n').map(colorize));
      res.json(server);
    }
  });
};


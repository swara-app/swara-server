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

var readAsync = function (file, callback) {
  fs.readFile(file, 'utf8', callback);
};

var colorize = function (line) {
  return convert.toHtml(line);
};

/**
 * Show the server information
 */
exports.view = function (req, res) {
  debug('Inside server.server-controller.view ');
  var app = req.app;
  var logsDirectory = 'logs';
  var server = {
    title : app.locals.title,
    env   : app.get('env'),
    port  : config.port,
    pid   : process.pid,
    db    : config.db
  };
  async.map([
    logsDirectory + '/' + config.appLogFile,
    logsDirectory + '/' + config.libraryLogFile
  ], readAsync, function (err, results) {
    debug('Read both log files asynchronously');
    if (err) {
      return res.status(400).send(err);
    } else {
      server.appLog = results[0].split('\n').map(colorize);
      server.libraryLog = results[1].split('\n').map(colorize);
      res.json(server);
    }
  });
};


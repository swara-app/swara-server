'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server-controller:server'),
  config = require('../../config/config');

/**
 * Show the server information
 */
exports.view = function (req, res) {
  debug('Inside server.server-controller.view ');
  var app = req.app;
  var server = {
    title     : app.locals.title,
    env       : app.get('env'),
    port      : app.get('server').address().port,
    pid       : process.pid,
    db        : config.db,
    debugPort : app.debugPort
  };
  res.json(server);
};


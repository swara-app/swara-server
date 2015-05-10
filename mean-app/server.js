'use strict';
/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server'),
  init = require('./config/init');

// initialize the configuration
init();

var config = require('./config/config'),
  mongoose = require('mongoose'),
  chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function (err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

global.debugPort = 5858;

app.debugMode = !!process && !!process.env && !!process.env.DEBUG && process.env.DEBUG.indexOf('swara') > -1 && process.platform !== 'win32';

app.getNextDebugPort = function () {
  debug('In getNextDebugPort to get the next available debug port');
  debug('Current debugPort: %d', global.debugPort);
  global.debugPort += 1;
  debug('New debugPort    : %d', global.debugPort);
  return global.debugPort;
};

app.appLogFile = config.appLogFile;
app.libraryLogFile = config.libraryLogFile;

app.start = function () {
  // Set up some connect/disconnect logging for the socket.io clients
  var io = app.get('socketio');
  io.on('connection', function (socket) {
    debug('A new websocket client has connected (identifier: %s)', socket.id);
    socket.on('disconnect', function () {
      debug('Websocket client disconnected (identifier: %s)', socket.id);
    });
  });
  // Start the app by listening on <port> for the socket.io enriched `server` instance
  debug('app.start - about to call app.get(\'server\').listen');
  app.get('server').listen(config.port);
  // Logging initialization
  console.log('MEAN.JS application started on port ' + config.port);
  debug('app.start end');
};

// Expose app
module.exports = app;


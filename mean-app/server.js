'use strict';
/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server'),
init = require('./config/init')(),
config = require('./config/config'),
mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('\x1b[31m', 'Could not connect to MongoDB!');
    console.log(err);
  }
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

app.start = function () {
  // Start the app by listening on <port>
  debug('app.start - about to call app.listen');
  app.listen(config.port);
  // Logging initialization
  console.log('MEAN.JS application started on port ' + config.port);
  debug('app.start end');
};

// Expose app
exports = module.exports = app;


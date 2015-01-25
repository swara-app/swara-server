'use strict';

/**
 * Module dependencies.
 */
var server = require('../../app/controllers/server.server.controller');

module.exports = function (app) {
  // Folder Routes
  app.route('/server')
    .get(server.view);
};

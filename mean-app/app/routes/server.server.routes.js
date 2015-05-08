'use strict';

/**
 * Module dependencies.
 */
var server = require('../../app/controllers/server.server.controller');

module.exports = function (app) {
  app.route('/server')
    .get(server.view);
};

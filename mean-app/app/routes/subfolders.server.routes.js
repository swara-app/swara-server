'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  subfolders = require('../../app/controllers/subfolders.server.controller');

module.exports = function (app) {
  // Subfolder Routes
  app.route('/subfolders/:subfolderId')
    .get(subfolders.read)
  .put(users.requiresLogin, subfolders.hasAuthorization, subfolders.update);

  // Finish by binding the subfolder middleware
  app.param('subfolderId', subfolders.subfolderByID);
};

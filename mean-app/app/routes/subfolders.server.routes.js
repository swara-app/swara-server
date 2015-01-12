'use strict';

/**
 * Module dependencies.
 */
var subfolders = require('../../app/controllers/subfolders.server.controller');

module.exports = function (app) {
  // Subfolder Routes
  app.route('/subfolders/:subfolderId')
    .get(subfolders.read);

  // Finish by binding the subfolder middleware
  app.param('subfolderId', subfolders.subfolderByID);
};

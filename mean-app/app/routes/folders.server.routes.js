'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  folders = require('../../app/controllers/folders.server.controller');

module.exports = function (app) {
  // Folder Routes
  app.route('/folders')
    .get(folders.list)
    .post(users.requiresLogin, folders.create);

  app.route('/folders/:folderId')
    .get(folders.read)
    .put(users.requiresLogin, folders.hasAuthorization, folders.update)
    .delete(users.requiresLogin, folders.hasAuthorization, folders.delete);

  // Finish by binding the folder middleware
  app.param('folderId', folders.folderByID);
};

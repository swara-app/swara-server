'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('swara:server-controller:folder'),
  fs = require('fs'),
  util = require('util'),
  mongoose = require('mongoose'),
  mkdirp = require('mkdirp'),
  escapeStringRegexp = require('escape-string-regexp'),
  errorHandler = require('./errors.server.controller'),
  cpHelper = require('../../libs/childProcessHelper'),
  Folder = mongoose.model('Folder'),
  Subfolder = mongoose.model('Subfolder'),
  _ = require('lodash'),
  spawnProcess = function (action, folder, libraryLogFile, tempDirPath) {
    var name = action === 'Add' ? 'scanner' : (action === 'Remove' ? 'cleaner' : '');
    if (!name) {
      throw new Error('Invalid action');
    }
    mkdirp.sync(tempDirPath);
    cpHelper.spawn({
      name          : util.format('%s `%s`', action, folder.path),
      command       : __dirname + '/../workers/background.js',
      logFile       : libraryLogFile,
      args          : [tempDirPath],
      onBeforeSpawn : function () {
        debug('About to start `%s` on the folder at %s', action, folder.path);
        fs.writeFileSync(util.format('%s%s.json', tempDirPath, name), JSON.stringify(folder.toObject()));
      },
      onAfterSpawn  : function () {
        debug('Successfully started `%s` on the folder at %s', action, folder.path);
      }
    });
  },
  cleanFolder = function (folder, libraryLogFile, tempDirPath) {
    spawnProcess('Remove', folder, libraryLogFile, tempDirPath);
  },
  scanFolder = function (folder, libraryLogFile, tempDirPath) {
    spawnProcess('Add', folder, libraryLogFile, tempDirPath);
  };

/**
 * Create a folder
 */
exports.create = function (req, res) {
  var folder = new Folder(req.body);
  folder.user = req.user;
  folder.scanning = true;
  var app = req.app;

  Subfolder.findOne({path : new RegExp('^' + escapeStringRegexp(folder.path))}, function (err, existingSubfolder) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      if (existingSubfolder) {
        return res.status(400).send({
          message : 'Folder is already in the library'
        });
      } else {
        folder.save(function (err) {
          if (err) {
            return res.status(400).send({
              message : errorHandler.getErrorMessage(err)
            });
          } else {
            // initiate an asynchronous scan on this folder
            _.defer(scanFolder, folder, app.locals.libraryLogFile, app.locals.tempDirectory);
            res.json(folder);
          }
        });
      }
    }
  });
};

/**
 * Show the current folder
 */
exports.read = function (req, res) {
  res.json(req.folder);
};

/**
 * Update a folder
 */
exports.update = function (req, res) {
  var folder = req.folder;
  var app = req.app;

  folder = _.extend(folder, req.body);
  folder.modified = Date.now();
  folder.save(function (err) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      if (folder.scanning) {
        // initiate a rescan on this folder
        _.defer(scanFolder, folder, app.locals.libraryLogFile, app.locals.tempDirectory);
      }
      res.json(folder);
    }
  });
};

/**
 * Delete an folder
 */
exports.delete = function (req, res) {
  var folder = req.folder;
  var app = req.app;

  _.defer(cleanFolder, folder, app.locals.libraryLogFile, app.locals.tempDirectory);

  folder.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(folder);
    }
  });
};

/**
 * List of Folders
 */
exports.list = function (req, res) {
  Folder.find().sort('-created').populate('user', 'displayName').populate('subfolders').exec(function (err, folders) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(folders);
    }
  });
};

/**
 * Folder middleware
 */
exports.folderByID = function (req, res, next, id) {
  Folder.findById(id).populate('user', 'displayName').populate('subfolders').exec(function (err, folder) {
    if (err) return next(err);
    if (!folder) return next(new Error('Failed to load folder ' + id));
    req.folder = folder;
    next();
  });
};

/**
 * Folder authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
  if (req.folder.user.id !== req.user.id) {
    return res.status(403).send({
      message : 'User is not authorized'
    });
  }
  next();
};

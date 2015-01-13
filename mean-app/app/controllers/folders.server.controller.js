'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Folder = mongoose.model('Folder'),
  cleaner = require('../workers/cleaner'),
  scanner = require('../workers/scanner'),
  _ = require('lodash');

/**
 * Create a folder
 */
exports.create = function (req, res) {
  var folder = new Folder(req.body);
  folder.user = req.user;
  folder.scanning = true;

  folder.save(function (err) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      // initiate an asynchronous scan on this folder
      _.defer(scanner.scanFolder, folder);
      res.json(folder);
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
        _.defer(scanner.scanFolder, folder);
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

  _.defer(cleaner.cleanFolder, folder);

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

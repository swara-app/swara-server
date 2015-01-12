'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Subfolder = mongoose.model('Subfolder');

/**
 * Show the current subfolder
 */
exports.read = function (req, res) {
  res.json(req.subfolder);
};

/**
 * Delete an subfolder
 */
exports.delete = function (req, res) {
  var subfolder = req.subfolder;

  subfolder.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message : errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(subfolder);
    }
  });
};

/**
 * Subfolder middleware
 */
exports.subfolderByID = function (req, res, next, id) {
  Subfolder.findById(id).populate('user', 'displayName').populate('tracks').exec(function (err, subfolder) {
    if (err) return next(err);
    if (!subfolder) return next(new Error('Failed to load subfolder ' + id));
    req.subfolder = subfolder;
    next();
  });
};

/**
 * Subfolder authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
  if (req.subfolder.user.id !== req.user.id) {
    return res.status(403).send({
      message : 'User is not authorized'
    });
  }
  next();
};

'use strict';

/*
 Removes all the containing subfolders and all their containing tracks when a folder is being deleted
 */

var debug = require('debug')('swara:cleaner'),
  async = require('async'),
  chalk = require('chalk'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  util = require('util'),
  errorHandler = require('../../controllers/errors.server.controller'),
  Subfolder = mongoose.model('Subfolder');

// Attach precise range plugin to moment
require('../../../libs/moment-precise-range')(moment);
chalk.enabled = true;

var cleaner = {
  cleanFolder : function (folder) {
    debug('Entering the cleanFolder function');
    var started = moment();
    console.info(chalk.green('*****'));
    console.log(util.format('Begin cleaning folder - ' + chalk.red('%s') + ' - (%s)', folder.path, started));
    async.each(folder.subfolders, function (subfolderObject, nextSubfolder) {
      Subfolder.findById(subfolderObject._id).populate('tracks').exec(function (err, subfolder) {
        async.each(subfolder.tracks, function (track, nextTrack) {
          track.remove(function (err) {
            if (err) {
              console.error(chalk.red(err));
              nextTrack(err);
            } else {
              console.log(util.format('Deleted track - ' + chalk.blue('%s'), track.path));
              nextTrack();
            }
          });
        }, function (err) {
          // deleted all tracks in this subfolder - move to next
          if (err) {
            console.error(chalk.red(err));
            nextSubfolder(err);
          } else {
            subfolder.remove(function (err) {
              if (err) {
                console.error(chalk.red(errorHandler.getErrorMessage(err)));
                nextSubfolder(errorHandler.getErrorMessage(err));
              } else {
                console.log(util.format('Deleted subfolder - ' + chalk.green('%s'), subfolder.path));
                nextSubfolder();
              }
            });
          }
        });
      });
    }, function (err) {
      if (err) {
        console.error(chalk.red(err));
      } else {
        // deleted all subfolders
        var ended = moment();
        var duration = moment.preciseDiff(started, ended);
        debug('Cleaned folder - %s - (%s)', folder.path, ended);
        console.log(util.format('Deleted tracks & subfolders in folder ' + chalk.green('%s') + ' in ' + chalk.red('%s'),
          folder.path, duration || 'a jiffy'));
        console.info(chalk.green('*****'));
      }
      console.info('Exiting background process: %s (pid)', process.pid);
      process.exit(!!err);
    });
  }
};

module.exports = cleaner;

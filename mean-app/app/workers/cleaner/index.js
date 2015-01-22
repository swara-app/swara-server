'use strict';

/*
 Removes all the containing subfolders and all their containing tracks when a folder is being deleted
 */

var debug = require('debug')('swara:cleaner'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  errorHandler = require('../../controllers/errors.server.controller'),
  Subfolder = mongoose.model('Subfolder');

// Attach precise range plugin to moment
require('../../../libs/moment-precise-range')(moment);

var cleaner = {
  cleanFolder : function (folder) {
    debug('Entering the cleanFolder function');
    var started = moment();
    console.info('*****');
    debug('Begin cleaning folder - %s - (%s)', folder.path, started);
    async.each(folder.subfolders, function (subfolderObject, nextSubfolder) {
      Subfolder.findById(subfolderObject._id).populate('tracks').exec(function (err, subfolder) {
        async.each(subfolder.tracks, function (track, nextTrack) {
          track.remove(function (err) {
            if (err) {
              console.error(err);
              nextTrack(err);
            } else {
              debug('Deleted track - %s', track.path);
              nextTrack();
            }
          });
        }, function (err) {
          // deleted all tracks in this subfolder - move to next
          if (err) {
            console.error(err);
            nextSubfolder(err);
          } else {
            subfolder.remove(function (err) {
              if (err) {
                console.error(errorHandler.getErrorMessage(err));
                nextSubfolder(errorHandler.getErrorMessage(err));
              } else {
                debug('Deleted subfolder - %s', subfolder.path);
                nextSubfolder();
              }
            });
          }
        });
      });
    }, function (err) {
      if (err) {
        console.error(err);
      } else {
        // deleted all subfolders
        var ended = moment();
        var duration = moment.preciseDiff(started, ended);
        debug('Cleaned folder - %s - (%s)', folder.path, ended);
        debug('Deleted tracks & subfolders in folder in %s', duration);
        console.info('*****');
      }
      console.info('Exiting background process: %s (pid)', process.pid);
      process.exit(!!err);
    });
  }
};

module.exports = cleaner;

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

var cleaner = {
  cleanFolder : function (folder) {
    debug('Entering the cleanFolder function');
    async.each(folder.subfolders, function (subfolderObject, nextSubfolder) {
      Subfolder.findById(subfolderObject._id).populate('tracks').exec(function (err, subfolder) {
        async.each(subfolder.tracks, function (track, nextTrack) {
          track.remove(function (err) {
            if (err) {
              console.error(err);
              nextTrack(err);
            } else {
              console.info('(%s) Successfully deleted track %s', moment(), track.path);
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
                console.info('(%s) Successfully deleted subfolder %s', moment(), subfolder.path);
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
        console.info('(%s) Successfully deleted all tracks and subfolders for %s', moment(), folder.path);
      }
      console.log('Exiting...');
      process.exit(!!err);
    });
  }
};

module.exports = cleaner;

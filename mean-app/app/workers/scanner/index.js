'use strict';

/*
 Scans the folders when they are being added to the library for the first time,
 as well as when the folders are explicitly being rescanned from the UI
 */

var debug = require('debug')('scanner'),
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  errorHandler = require('../../controllers/errors.server.controller'),
  Folder = mongoose.model('Folder'),
  Subfolder = mongoose.model('Subfolder'),
  Album = mongoose.model('Album'),
  Artist = mongoose.model('Artist'),
  Genre = mongoose.model('Genre'),
  Track = mongoose.model('Track'),
  mm = require('musicmetadata'),
  walk = require('walk');

// Attach precise range plugin to moment
require('../../../libs/moment-precise-range')(moment);

var FOLDER_UPDATE_THRESHOLD = 25;

var incrementDictionaryItemCount = function (dict, item) {
  if (!dict[item]) {
    dict[item] = 0;
  }
  dict[item] += 1;
  return dict;
};

var scanner = {
  scanFolder : function (folder) {
    // total files count and total music files count for the folder on the main folders collection
    // walk all the files in folder and subfolders
    //    keep recording total files and music files counts for all subfolders to the SubFolders collection
    //    for the files, if it is a music file, capture metadata into the Tracks collection

    var started = moment();
    console.info('*****');
    console.info('(%s) Begin scanning the folder %s', started, folder.path);

    var totalFilesDictionary = {};
    var musicFilesDictionary = {};

    var options = {
      followLinks : false, filters : ['Temp', '_Temp']
    };

    var walker = walk.walk(folder.path, options);

    walker.on('file', function (root, fileStats, next) {
      totalFilesDictionary = incrementDictionaryItemCount(totalFilesDictionary, root);

      if (fileStats.name.match(/\.mp3$/i)) {

        var musicFilepath = path.join(root, fileStats.name);
        var parser = mm(fs.createReadStream(musicFilepath));
        parser.on('metadata', function (metadata) {
          // have the metadata here -> Save the Track
          //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
          //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
          Track.findOne({path : musicFilepath}, function (err, existingTrack) {
            if (err) {
              console.error(err);
            } else {
              var action = "added";
              var track = {};
              if (existingTrack) {
                action = "updated";
                track = _.extend(existingTrack, track);
              } else {
                track = new Track();
              }
              track.modified = track.lastScanned = Date.now();
              track.parentFolder = folder;
              track.path = musicFilepath;
              track.title = metadata.title || '';
              var year = parseInt(metadata.year || '', 10);
              if (!Number.isNaN(year)) {
                track.year = year;
              }
              track.album = metadata.album || '';
              track.artist = metadata.artist.join(', ');
              track.genre = metadata.genre.join(', ');
              track.user = folder.user;
              track.save(function (err) {
                if (err) {
                  console.error(errorHandler.getErrorMessage(err));
                } else {
                  musicFilesDictionary = incrementDictionaryItemCount(musicFilesDictionary, root);
                  console.info('(%s) Successfully %s the track %s', moment(), action, musicFilepath);
                }
              });
            }
          });
        });
      }
      next();
    });

    walker.on('errors', function (root, nodeStatsArray, next) {
      console.error('Error within scanner - nodeStatsArray:');
      console.error(nodeStatsArray);
      next();
    });

    walker.on('end', function () {
      // save the in memory dictionaries as new sub-folders
      var processed = 0;
      var totalFilesCount = 0;
      var musicFilesCount = 0;
      _.forEach(totalFilesDictionary, function (totalFiles, subfolderPath) {
        Subfolder.findOne({path : subfolderPath}, function (err, existingSubfolder) {
          if (err) {
            console.error(err);
          } else {
            // increment the counter and collect the cumulatives
            processed++;
            totalFilesCount += totalFiles;
            var m = musicFilesDictionary[subfolderPath];
            if (m) {
              musicFilesCount += m;
            }

            var action = "added";
            var subfolder = {};
            if (existingSubfolder) {
              action = "updated";
              subfolder = _.extend(existingSubfolder, subfolder);
            } else {
              subfolder = new Subfolder();
            }
            subfolder.parentFolder = folder;
            subfolder.path = subfolderPath;
            subfolder.filesCount = totalFiles;
            subfolder.musicFilesCount = musicFilesDictionary[subfolderPath] || 0;
            subfolder.modified = subfolder.lastScanned = Date.now();
            subfolder.save(function (err) {
              if (err) {
                console.error(errorHandler.getErrorMessage(err));
              } else {
                console.info('(%s) Successfully %s the subfolder %s', moment(), action, subfolderPath);
              }
            });
            var totalFolders = Object.keys(totalFilesDictionary).length;
            if (processed === totalFolders) {
              // update the root folder entry
              var foldersCount = totalFolders - 1;
              folder.foldersCount = foldersCount;
              folder.filesCount = totalFilesCount;
              folder.musicFilesCount = musicFilesCount;
              folder.scanning = false;
              folder.scanned = true;
              folder.lastScanned = folder.modified = Date.now();

              folder.save(function (err) {
                if (err) {
                  console.error(err);
                } else {
                  console.info('(%s) Successfully scanned the folder %s', moment(), folder.path);
                  var ended = moment();
                  var duration = moment.preciseDiff(started, ended);
                  console.info('(%s) Done scanning the folder %s', ended, folder.path);
                  console.log('Scanned %s music files (out of %s total files) from %s folders in %s', musicFilesCount,
                    totalFilesCount, foldersCount, duration);
                  console.info('*****');
                }
              });

            }
          }
        });
      });


    });
  }
};

module.exports = scanner;

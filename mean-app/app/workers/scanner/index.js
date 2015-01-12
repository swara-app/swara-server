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

    var musicFilePaths = [];

    var options = {
      followLinks : false, filters : ['Temp', '_Temp']
    };

    var walker = walk.walk(folder.path, options);

    walker.on('file', function (root, fileStats, next) {
      totalFilesDictionary = incrementDictionaryItemCount(totalFilesDictionary, root);

      if (fileStats.name.match(/\.mp3$/i)) {
        // save the filepaths for music files into an array
        musicFilePaths.push(path.join(root, fileStats.name));
      }
      next();
    });

    walker.on('errors', function (root, nodeStatsArray, next) {
      console.error('Error within scanner - nodeStatsArray:');
      console.error(nodeStatsArray);
      next();
    });

    walker.on('end', function () {
      // process all the music files from the musicfilepaths array
      async.each(musicFilePaths, function (musicFilepath, next) {
        var musicFileStream = fs.createReadStream(musicFilepath);
        if (!musicFilepath) {
          console.log('(%s) Cannot open file %s', moment(), musicFilepath);
          next();
        }
        var parser = mm(musicFileStream);
        parser.on('metadata', function (metadata) {
          // have the metadata here -> Save the Track
          //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
          //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
          Track.findOne({path : musicFilepath}, function (err, existingTrack) {
            if (err) {
              console.error(err);
              next();
            } else {
              var action = 'added';
              var track = {};
              if (existingTrack) {
                action = 'updated';
                track = _.extend(existingTrack, track);
              } else {
                track = new Track();
              }
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
              track.modified = track.lastScanned = Date.now();
              track.user = folder.user;
              track.save(function (err) {
                if (err) {
                  console.error(errorHandler.getErrorMessage(err));
                } else {
                  musicFilesDictionary = incrementDictionaryItemCount(musicFilesDictionary, path.dirname(musicFilepath));
                  console.info('(%s) Successfully %s the track %s', moment(), action, musicFilepath);
                }
                next();
              });
            }
          });
        });
        parser.on('done', function (err) {
          if (err) {
            console.warn('(%s) Error in parsing the music file %s', moment(), musicFilepath);
            console.warn('%j', err);
            next();
          }
        });
      }, function (err) { // done processing all files or there was an error
        if (err) {
          console.error('(%s) Error processing one of the music files', moment());
          console.error(err);
        } else {
          // save the in memory dictionaries as new sub-folders
          var processed = 0;
          var cumulativeMusicFilesCount = 0;
          var subfolderArray = [];
          async.each(Object.keys(musicFilesDictionary), function (subfolderPath, next) {
            var musicFilesCount = musicFilesDictionary[subfolderPath];
            Subfolder.findOne({path : subfolderPath}, function (err, existingSubfolder) {
              if (err) {
                next(err);
              } else {
                // increment the counter and collect the cumulatives
                processed++;
                cumulativeMusicFilesCount += musicFilesCount;

                var action = 'added';
                var subfolder = {};
                if (existingSubfolder) {
                  action = 'updated';
                  subfolder = _.extend(existingSubfolder, subfolder);
                } else {
                  subfolder = new Subfolder();
                }
                subfolder.parentFolder = folder;
                subfolder.path = subfolderPath;
                subfolder.title = subfolderPath.substr(subfolderPath.lastIndexOf(path.sep) + 1);
                subfolder.filesCount = totalFilesDictionary[subfolderPath];
                subfolder.musicFilesCount = musicFilesCount;
                subfolder.modified = subfolder.lastScanned = Date.now();
                subfolder.user = folder.user;
                subfolder.save(function (err, subfolder) {
                  if (err) {
                    next(errorHandler.getErrorMessage(err));
                  } else {
                    subfolderArray.push(subfolder);
                    console.info('(%s) Successfully %s the subfolder %s', moment(), action, subfolderPath);
                    next();
                  }
                });
              }
            });
          }, function (err) { // done saving all subfolders
            // update the root folder entry
            if (err) {
              console.error(err);
            } else {
              var foldersCount = Object.keys(totalFilesDictionary).length;
              var musicFoldersCount = Object.keys(musicFilesDictionary).length;
              var totalFilesCount = _.values(totalFilesDictionary).reduce(function (prev, curr) {
                return prev + curr;
              });
              folder.foldersCount = foldersCount;
              folder.musicFoldersCount = musicFoldersCount;
              folder.filesCount = totalFilesCount;
              folder.musicFilesCount = cumulativeMusicFilesCount;
              folder.scanning = false;
              folder.scanned = true;
              folder.subfolders = subfolderArray;
              folder.lastScanned = folder.modified = Date.now();

              folder.save(function (err) {
                if (err) {
                  console.error(errorHandler.getErrorMessage(err));
                } else {
                  console.info('(%s) Successfully scanned the folder %s', moment(), folder.path);
                  var ended = moment();
                  var duration = moment.preciseDiff(started, ended);
                  console.info('(%s) Done scanning the folder %s', ended, folder.path);
                  console.log('Scanned %s music files (out of %s total files) from %s folders (out of %s total folders) in %s',
                    cumulativeMusicFilesCount, totalFilesCount, musicFoldersCount, foldersCount, duration);
                  console.info('*****');
                }
              });
            }
          });
        }
      });
    });
  }
};

module.exports = scanner;

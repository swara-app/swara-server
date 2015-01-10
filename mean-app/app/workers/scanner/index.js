'use strict';

/*
 Scans the folders when they are being added to the library for the first time,
 as well as when the folders are explicitly being rescanned from the UI
 */

var debug = require('debug')('scanner'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
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

    console.info('*****');
    console.info('Begin scanning the folder %s', folder.path);

    var totalFilesDictionary = {};
    var musicFilesDictionary = {};

    var options = {
      followLinks : false, filters : ['Temp', '_Temp']
    };

    var walker = walk.walk(folder.path, options);

    walker.on('file', function (root, fileStats, next) {
      totalFilesDictionary = incrementDictionaryItemCount(totalFilesDictionary, root);

      if (fileStats.name.match(/\.mp3$/i)) {

        musicFilesDictionary = incrementDictionaryItemCount(musicFilesDictionary, root);

        var musicFilepath = path.join(root, fileStats.name);
        var parser = mm(fs.createReadStream(musicFilepath));
        parser.on('metadata', function (metadata) {
          // have the metadata here -> Save the Track
          //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
          //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
          var track = new Track();
          track.parentFolderId = folder.id;
          track.path = musicFilepath;
          track.lastScanned = Date.now();
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
              console.error(err);
            } else {
              console.info('Successfully added %s', musicFilepath);
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
      _.forEach(totalFilesDictionary, function (totalFiles, subfolderPath) {
        if (subfolderPath !== folder.path) {
          Subfolder.findOne({path : subfolderPath}, function (err, existingSubfolder) {
            if (err) {
              console.error(err);
            } else {
              var subfolder = new Subfolder();
              subfolder.parentFolderId = folder.id;
              subfolder.path = subfolderPath;
              subfolder.filesCount = totalFiles;
              subfolder.musicFilesCount = musicFilesDictionary[subfolderPath] || 0;
              subfolder.lastScanned = Date.now();
              if (existingSubfolder) {
                subfolder = _.extend(existingSubfolder, subfolder);
              }
              subfolder.save(function (err) {
                if (err) {
                  console.error(errorHandler.getErrorMessage(err));
                } else {
                  console.info('Successfully added the subfolder %s', subfolderPath);
                }
              });
            }
          });
        }
      });

      // update the root folder entry
      folder.foldersCount = Object.keys(totalFilesDictionary).length - 1;
      folder.filesCount = _.values(totalFilesDictionary).reduce(function (prev, cur) {
        return prev + cur;
      });
      folder.musicFilesCount = _.values(musicFilesDictionary).reduce(function (prev, cur) {
        return prev + cur;
      });
      folder.scanning = false;
      folder.scanned = true;
      folder.lastScanned = folder.modified = Date.now();

      folder.save(function (err) {
        if (err) {
          console.error(err);
        } else {
          console.info('Successfully scanned the folder %s', folder.path);
        }
      });

      console.info('Done scanning the folder %s', folder.path);
      console.info('*****');

    });
  }
};

module.exports = scanner;

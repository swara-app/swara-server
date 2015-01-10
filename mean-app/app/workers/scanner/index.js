'use strict';

/*
 Scans the folders when they are being added to the library for the first time,
 as well as when the folders are explicitly being rescanned from the UI
 */

var debug = require('debug')('scanner'),
  fs = require('fs'),
  mm = require('musicmetadata'),
  path = require('path'),
  walk = require('walk');

var scanner = {
  scanFolder : function (folderPath) {
    // update SHA1, total files count and total music files count for the folder on the main folders collection
    // walk all the files in folder and subfolders
    //    keep recording SHA1, total files and music files counts for all subfolders to the SubFolders collection
    //    for the files, if it is a music file record SHA1, capture metadata into the Tracks collection
    var options, walker;

    options = {
      followLinks : false, filters : ['Temp', '_Temp']
    };

    walker = walk.walk(folderPath, options);

    walker.on('file', function (root, fileStats, next) {
      var filepath = path.join(root, fileStats.name);
      debug('Filename: %s', filepath);
      if (fileStats.name.match(/\.mp3$/)) {
        var parser = mm(fs.createReadStream(filepath));
        parser.on('metadata', function (track) {
          // have the metadata here -> Save the Track
          //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
          //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
          console.log(track);
        });
      } else {
        console.log('skipping non-mp3 file %s', filepath);
      }
      next();
    });

    walker.on('errors', function (root, nodeStatsArray, next) {
      console.error('Error within scanner - nodeStatsArray:');
      console.error(nodeStatsArray);
      next();
    });

    walker.on('end', function () {
      // save the in memory dictionaries for sub-folders and update the root-folder
      console.info('scanner is done');
    });
  }
};

module.exports = scanner;

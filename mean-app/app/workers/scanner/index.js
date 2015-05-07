'use strict';

/*
 Scans the folders when they are being added to the library for the first time,
 as well as when the folders are explicitly being rescanned from the UI
 */

var debug = require('debug')('swara:scanner'),
  chalk = require('chalk'),
  util = require('util'),
  domain = require('domain').create(),
  moment = require('moment'),
  mongoose = require('mongoose'),
  processFiles = require('./processFiles'),
  walker = require('./walker'),
  Folder = mongoose.model('Folder');

// Attach precise range plugin to moment
require('../../../libs/moment-precise-range')(moment);
chalk.enabled = true;

var scanner = {
  scanFolder : function (folderObject) {

    domain.on('error', function (error) {
      console.error('!!ERROR: %j', error);
    });

    domain.run(function () {

      // total files count and total music files count for the folder on the main folders collection
      // walk all the files in folder and subfolders
      //    keep recording total files and music files counts for all subfolders to the SubFolders collection
      //    for the files, if it is a music file, capture metadata into the Tracks collection
      Folder.findOne({path : folderObject.path}, function (err, folder) {
        if (err) {
          console.error(chalk.red(err));
        } else {
          debug('Entering the scanFolder function');
          var started = moment();
          console.info(chalk.green('*****'));
          console.log(util.format('Begin scanning folder - ' + chalk.red('%s') + ' - (%s)', folder.path, started));

          var files = {
            musicFilepaths       : [],
            tracksBySubfolder    : {},
            fileCountBySubfolder : {}
          };

          var allDoneCallback = function (folder, musicFilesCount, allFilesCount, musicFoldersCount, allFoldersCount) {
            debug('Updated folder - %s', folder.path);
            var ended = moment();
            var duration = moment.preciseDiff(started, ended);
            debug('Scanned folder - %s - (%s)', folder.path, ended);
            console.log(util.format('Scanned ' + chalk.red('%s') + ' music files (out of ' + chalk.red('%s') +
              ' total files) from ' + chalk.red('%s') + ' folders (out of ' + chalk.red('%s') + ' total folders) in ' +
              chalk.green('%s'), musicFilesCount, allFilesCount, musicFoldersCount, allFoldersCount, duration || 'a jiffy'));
            console.info(chalk.green('*****'));
          };

          walker.walkFolder(folder,
            processFiles.createWalkerFileHandler(files),
            processFiles.createWalkerEndHandler(folder, files, allDoneCallback),
            function (root, nodeStatsArray, next) {
              console.error(chalk.red('Error within scanner - nodeStatsArray:'));
              console.error(nodeStatsArray);
              next();
            });
        }
      });

    });

  }
};

module.exports = scanner;

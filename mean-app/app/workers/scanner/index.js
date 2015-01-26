'use strict';

/*
 Scans the folders when they are being added to the library for the first time,
 as well as when the folders are explicitly being rescanned from the UI
 */

var debug = require('debug')('swara:scanner'),
  async = require('async'),
  chalk = require('chalk'),
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  _ = require('lodash'),
  mm = require('musicmetadata'),
  walk = require('walk'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  errorHandler = require('../../controllers/errors.server.controller'),
  Folder = mongoose.model('Folder'),
  Subfolder = mongoose.model('Subfolder'),
  Track = mongoose.model('Track');

// Attach precise range plugin to moment
require('../../../libs/moment-precise-range')(moment);
chalk.enabled = true;

var getTitleFromPath = function (musicFilePath) {
  if (!musicFilePath) {
    return null;
  }
  var title = musicFilePath.substr(musicFilePath.lastIndexOf(path.sep) + 1);
  return title.substr(0, title.lastIndexOf('.'));
};

var incrementDictionaryItemCount = function (dict, item) {
  if (!dict[item]) {
    dict[item] = 0;
  }
  dict[item] += 1;
  return dict;
};

var scanner = {
  scanFolder : function (folderObject) {
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

        var totalFilesDictionary = {};
        var musicFilesDictionary = {};

        var musicFilepaths = [];

        var options = {
          followLinks : false, filters : ['Temp', '_Temp']
        };

        var walker = walk.walk(folder.path, options);

        debug('Setting up on file event handler for the walker');
        walker.on('file', function (root, fileStats, next) {
          var filepath = path.join(root, fileStats.name);
          debug('Walking file - %s', filepath);
          totalFilesDictionary = incrementDictionaryItemCount(totalFilesDictionary, root);

          if (fileStats.name.match(/\.mp3$/i)) {
            musicFilepaths.push(filepath);
          }
          next();
        });

        debug('Setting up on error event handler for the walker');
        walker.on('errors', function (root, nodeStatsArray, next) {
          console.error(chalk.red('Error within scanner - nodeStatsArray:'));
          console.error(nodeStatsArray);
          next();
        });

        debug('Setting up on end event handler for the walker');
        walker.on('end', function () {
          // process all the music files from the musicfilepaths array
          debug('About to start parsing %s music filepaths', musicFilepaths.length);
          var counter = 0;
          async.eachLimit(musicFilepaths, 100, function (musicFilepath, nextTrack) {
            var musicFileStream = fs.createReadStream(musicFilepath);
            if (!musicFilepath) {
              console.log('(%s) Cannot open file %s', moment(), musicFilepath);
              counter++;
              nextTrack();
            }
            var parser = mm(musicFileStream);
            var hasMetadata = {};
            parser.on('metadata', function (metadata) {
              // have the metadata here -> Save the Track
              //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
              //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
              hasMetadata[musicFilepath] = true;
              Track.findOne({path : musicFilepath}, function (err, existingTrack) {
                if (err) {
                  console.error(chalk.red(err));
                  counter++;
                  nextTrack();
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
                  track.title = metadata.title || getTitleFromPath(musicFilepath);
                  var year = parseInt(metadata.year || '', 10);
                  if (!Number.isNaN(year)) {
                    track.year = year;
                  }
                  if (metadata.track && metadata.track.no) {
                    track.trackNumber = metadata.track.no;
                  }
                  track.album = metadata.album || '';
                  track.artist = metadata.artist.join(', ');
                  track.genre = metadata.genre.join(', ');
                  track.modified = track.lastScanned = Date.now();
                  track.user = folder.user;
                  track.save(function (err, track) {
                    counter++;
                    if (err) {
                      console.error(chalk.red(errorHandler.getErrorMessage(err)));
                    } else {
                      var subfolderPath = path.dirname(musicFilepath);
                      if (!musicFilesDictionary[subfolderPath]) {
                        musicFilesDictionary[subfolderPath] = [];
                      }
                      musicFilesDictionary[subfolderPath].push(track);
                      console.log(util.format(chalk.gray('%s') + ' - %s track - ' + chalk.blue('%s'),
                        counter, action, musicFilepath));
                    }
                    nextTrack();
                  });
                }
              });
            });
            parser.on('done', function (err) {
              if (err) {
                console.warn(util.format(chalk.red('Error in parsing the music file %s'), musicFilepath));
                console.warn(err);
                counter++;
                nextTrack();
              } else {
                if (!hasMetadata[musicFilepath]) {  // for some reason there is no metadata
                  console.warn(util.format(chalk.red('Error obtaining metadata for %s'), musicFilepath));
                  nextTrack();
                }
              }
            });
          }, function (err) { // done processing all files or there was an error
            debug('Done processing all the musicFilepaths from array');
            if (err) {
              console.error(util.format(chalk.red('Error processing one of the music files - (%s)'), moment()));
              console.error(chalk.red(err));
            } else {
              // save the in memory dictionaries as new sub-folders
              var processed = 0;
              var cumulativeMusicFilesCount = 0;
              var subfolderArray = [];
              debug('About to iterate through the musicFilesDictionary which has %s items', Object.keys(musicFilesDictionary).length);
              async.eachLimit(Object.keys(musicFilesDictionary), 20, function (subfolderPath, nextSubfolder) {
                var musicFilesCount = musicFilesDictionary[subfolderPath].length;
                Subfolder.findOne({path : subfolderPath}, function (err, existingSubfolder) {
                  if (err) {
                    nextSubfolder(err);
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
                    subfolder.tracks = musicFilesDictionary[subfolderPath];
                    subfolder.modified = subfolder.lastScanned = Date.now();
                    subfolder.user = folder.user;
                    subfolder.save(function (err, subfolder) {
                      if (err) {
                        nextSubfolder(errorHandler.getErrorMessage(err));
                      } else {
                        subfolderArray.push(subfolder);
                        console.log(util.format('%s subfolder ' + chalk.green('%s'), action, subfolderPath));
                        nextSubfolder();
                      }
                    });
                  }
                });
              }, function (err) { // done saving all subfolders
                debug('Done iterating and saving all subfolders');
                // update the root folder entry
                if (err) {
                  console.error(chalk.red(err));
                } else {
                  var foldersCount = Object.keys(totalFilesDictionary).length;
                  var musicFoldersCount = Object.keys(musicFilesDictionary).length;
                  var totalFilesCount = 0;
                  if (foldersCount) {
                    totalFilesCount = _.values(totalFilesDictionary).reduce(function (prev, curr) {
                      return prev + curr;
                    });
                  }
                  folder.foldersCount = foldersCount;
                  folder.musicFoldersCount = musicFoldersCount;
                  folder.filesCount = totalFilesCount;
                  folder.musicFilesCount = cumulativeMusicFilesCount;
                  folder.scanning = false;
                  folder.subfolders = subfolderArray;
                  folder.lastScanned = folder.modified = Date.now();

                  folder.save(function (err) {
                    if (err) {
                      console.error(chalk.red(errorHandler.getErrorMessage(err)));
                    } else {
                      debug('Updated folder - %s', folder.path);
                      var ended = moment();
                      var duration = moment.preciseDiff(started, ended);
                      debug('Scanned folder - %s - (%s)', folder.path, ended);
                      console.log(util.format('Scanned ' + chalk.red('%s') + ' music files (out of ' + chalk.red('%s') +
                      ' total files) from ' + chalk.red('%s') + ' folders (out of ' + chalk.red('%s') + ' total folders) in ' +
                      chalk.green('%s'), cumulativeMusicFilesCount, totalFilesCount, musicFoldersCount, foldersCount, duration || 'a jiffy'));
                      console.info(chalk.green('*****'));
                    }
                    console.info('Exiting background process: %s (pid)', process.pid);
                    process.exit(!!err);
                  });
                }
              });
            }
          });
        });
      }
    });
  }
};

module.exports = scanner;

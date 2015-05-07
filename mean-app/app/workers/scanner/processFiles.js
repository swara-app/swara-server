'use strict';

var debug = require('debug')('swara:processFiles'),
  async = require('async'),
  chalk = require('chalk'),
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  _ = require('lodash'),
  mm = require('musicmetadata'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  errorHandler = require('../../controllers/errors.server.controller'),
  Subfolder = mongoose.model('Subfolder'),
  Track = mongoose.model('Track');

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

// ** Reference **
//  var files = {
//    musicFilepaths       : [],
//    tracksBySubfolder    : {},
//    fileCountBySubfolder : {}
//  };
//

var createProcessFileIterator = function (folder, files) {
  var counter = 0;
  return function (musicFilepath, nextTrack) {
      var musicFileStream = fs.createReadStream(musicFilepath);
      if (!musicFileStream) {
        console.log('(%s) Cannot open file %s', moment(), musicFilepath);
        counter++;
        nextTrack();
      }
      mm(musicFileStream, function (err, metadata) {
        if (err) {
          console.warn(util.format(chalk.red('Error in parsing the music file %s'), musicFilepath));
          console.warn(err);
          counter++;
          musicFileStream.destroy();
          nextTrack();
        } else {
          // have the metadata here -> Save the Track
          //  check if the sub-folder for this track is already added into the sub-folder dictionary and add it if it is not
          //    increment the tracks count for the root-folder and sub-folder in the in-memory variables
          Track.findOne({path : musicFilepath}, function (err, existingTrack) {
            if (err) {
              console.error(chalk.red(err));
              counter++;
              musicFileStream.destroy();
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
                  if (!files.tracksBySubfolder[subfolderPath]) {
                    files.tracksBySubfolder[subfolderPath] = [];
                  }
                  files.tracksBySubfolder[subfolderPath].push(track);
                  console.log(util.format(chalk.gray('%s') + ' - %s track - ' + chalk.blue('%s'),
                    counter, action, musicFilepath));
                }
                musicFileStream.destroy();
                nextTrack();
              });

            }
          });
        }
      });
  };
};

var processFiles = {
  /**
   * Creates a listener for the `file` event emitted by `walk` that adds all the walked files
   * into the internal buffer - `files`
   * @param files The buffer where the array of files and the dictionaries of music files and total files is stored
   * @returns {Function}
   */
  createWalkerFileHandler : function (files) {
    return function (root, fileStats, next) {
      var filepath = path.join(root, fileStats.name);
      debug('Walking file - %s', filepath);
      files.fileCountBySubfolder = incrementDictionaryItemCount(files.fileCountBySubfolder, root);

      if (fileStats.name.match(/\.mp3$/i)) {
        files.musicFilepaths.push(filepath);
      }
      next();
    };
  },
  /**
   * Creates a listener for the `end` event emitted by `walk` to process the buffer - `files`
   * @param folder The folder being scanned
   * @param files The buffer where the array of files and the dictionaries of music files and total files is stored
   * @param allDoneCallback Callback that will be called when all of the walked files have been processed
   * @returns {Function}
   */
  createWalkerEndHandler  : function (folder, files, allDoneCallback) {
    return function () {
      // process all the music files from the musicfilepaths array
      debug('About to start parsing %s music filepaths', files.musicFilepaths.length);
      async.eachSeries(files.musicFilepaths, createProcessFileIterator(folder, files), function (err) { // done processing all files or there was an error
        debug('Done processing all the musicFilepaths from array');
        if (err) {
          console.error(util.format(chalk.red('Error processing one of the music files - (%s)'), moment()));
          console.error(chalk.red(err));
        } else {
          // save the in memory dictionaries as new sub-folders
          var processed = 0;
          var cumulativeMusicFilesCount = 0;
          var subfolders = [];
          var subfolderPaths = Object.keys(files.tracksBySubfolder);

          debug('About to iterate through the subfolderPaths which has %s items', subfolderPaths.length);
          async.eachSeries(subfolderPaths, function (subfolderPath, nextSubfolder) {
            var subfolderTracks = files.tracksBySubfolder[subfolderPath];
            var musicFilesCount = subfolderTracks.length;
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
                  subfolder.parentFolder = folder;
                  subfolder.path = subfolderPath;
                  subfolder.title = subfolderPath.substr(subfolderPath.lastIndexOf(path.sep) + 1);
                }
                subfolder.filesCount = files.fileCountBySubfolder[subfolderPath];
                subfolder.musicFilesCount = musicFilesCount;
                subfolder.tracks = subfolderTracks;
                subfolder.modified = subfolder.lastScanned = Date.now();
                subfolder.user = folder.user;

                subfolder.save(function (err, subfolder) {
                  if (err) {
                    nextSubfolder(errorHandler.getErrorMessage(err));
                  } else {
                    subfolders.push(subfolder);
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
              var foldersCount = Object.keys(files.fileCountBySubfolder).length;
              var musicFoldersCount = Object.keys(files.tracksBySubfolder).length;
              var totalFilesCount = 0;
              if (foldersCount) {
                totalFilesCount = _.values(files.fileCountBySubfolder).reduce(function (prev, curr) {
                  return prev + curr;
                });
              }
              folder.foldersCount = foldersCount;
              folder.musicFoldersCount = musicFoldersCount;
              folder.filesCount = totalFilesCount;
              folder.musicFilesCount = cumulativeMusicFilesCount;
              folder.scanning = false;
              folder.subfolders = subfolders;
              folder.lastScanned = folder.modified = Date.now();

              folder.save(function (err) {
                if (err) {
                  console.error(chalk.red(errorHandler.getErrorMessage(err)));
                } else {
                  allDoneCallback(folder, cumulativeMusicFilesCount, totalFilesCount, musicFoldersCount, foldersCount);
                }
                console.info('Exiting background process: %s (pid)', process.pid);
                process.exit(!!err);
              });

            }
          });
        }
      });
    };
  }
};

module.exports = processFiles;

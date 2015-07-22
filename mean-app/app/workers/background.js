#!/usr/bin/env node --use_strict

console.log('background process has begun');

var fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  chalk = require('chalk'),
  init = require('../../config/init'),
  config = require('../../config/config'),
  tempDirPath = null;

if (process.argv.length === 4) {
  tempDirPath = process.argv[3];
}

var scannerJson = tempDirPath + 'scanner.json',
  cleanerJson = tempDirPath + 'cleaner.json';

init();

// connect to the database
mongoose.connect(config.db, function (err) {
  'use strict';
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

// set up the models
config.getGlobbedFiles(__dirname + '/../models/**/*.js').forEach(function (modelPath) {
  'use strict';
  require(path.resolve(modelPath));
});

// start either the scanner or the cleaner as the background task
if (fs.existsSync(scannerJson)) {
  console.log('background process is a scanner');
  fs.readFile(scannerJson, {encoding : 'utf8'}, function (err, data) {
    'use strict';
    if (err) {
      console.error(err);
    } else {
      require('./scanner/index').scanFolder(JSON.parse(data));
      fs.unlinkSync(scannerJson);
    }
  });
} else if (fs.existsSync(cleanerJson)) {
  console.log('background process is a cleaner');
  fs.readFile(cleanerJson, {encoding : 'utf8'}, function (err, data) {
    'use strict';
    if (err) {
      console.error(err);
    } else {
      require('./cleaner/index').cleanFolder(JSON.parse(data));
      fs.unlinkSync(cleanerJson);
    }
  });
}

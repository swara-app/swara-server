'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Subfolder Schema
 */
var SubfolderSchema = new Schema({
  created         : {
    type    : Date,
    default : Date.now
  },
  parentFolderId  : {
    type     : String,
    required : 'Parent folder ID is mandatory'
  },
  lastScanned     : Date,
  filesCount      : {
    type    : Number,
    default : 0
  },
  musicFilesCount : {
    type    : Number,
    default : 0
  },
  path            : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Path cannot be blank'
  }
});

mongoose.model('Subfolder', SubfolderSchema);

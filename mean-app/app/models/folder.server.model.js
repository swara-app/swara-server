'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Folder Schema
 */
var FolderSchema = new Schema({
  created         : {
    type    : Date,
    default : Date.now
  },
  modified        : {
    type    : Date,
    default : Date.now
  },
  scanning        : {
    type    : Boolean,
    default : false
  },
  scanned         : {
    type    : Boolean,
    default : false
  },
  lastScanned     : Date,
  foldersCount    : {
    type    : Number,
    default : 0
  },
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
  },
  title           : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Title cannot be blank'
  },
  user            : {
    type : Schema.ObjectId,
    ref  : 'User'
  }
});

mongoose.model('Folder', FolderSchema);

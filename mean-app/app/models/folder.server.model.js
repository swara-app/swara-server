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
  created      : {
    type    : Date,
    default : Date.now
  },
  path         : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Path cannot be blank'
  },
  scanning     : {
    type    : Boolean,
    default : false
  },
  scanned      : {
    type    : Boolean,
    default : false
  },
  lastScanned  : Date,
  foldersCount : {
    type    : Number,
    default : 0,
  },
  filesCount   : {
    type    : Number,
    default : 0,
  },
  user         : {
    type : Schema.ObjectId,
    ref  : 'User'
  }
});

mongoose.model('Folder', FolderSchema);

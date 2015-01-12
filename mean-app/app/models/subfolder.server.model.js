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
  modified        : {
    type    : Date,
    default : Date.now
  },
  parentFolder    : {
    type : Schema.ObjectId,
    ref  : 'Folder'
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
  tracks          : [
    {
      type : Schema.Types.ObjectId,
      ref  : 'Track'
    }
  ],
  path            : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Path cannot be blank',
    unique   : true
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

mongoose.model('Subfolder', SubfolderSchema);

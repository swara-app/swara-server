'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Track Schema
 */
var TrackSchema = new Schema({
  created        : {
    type    : Date,
    default : Date.now
  },
  parentFolderId : {
    type     : String,
    required : 'Parent folder ID is mandatory'
  },
  lastScanned    : Date,
  path           : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Path cannot be blank'
  },
  title          : {
    type    : String,
    default : '',
    trim    : true
  },
  year           : Number,
  album          : {
    type    : String,
    default : '',
    trim    : true
  },
  artist         : {
    type    : String,
    default : '',
    trim    : true
  },
  genre          : {
    type    : String,
    default : '',
    trim    : true
  },
  user           : {
    type : Schema.ObjectId,
    ref  : 'User'
  }
});

mongoose.model('Track', TrackSchema);

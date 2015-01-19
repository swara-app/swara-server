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
  created      : {
    type    : Date,
    default : Date.now
  },
  modified     : {
    type    : Date,
    default : Date.now
  },
  parentFolder : {
    type : Schema.ObjectId,
    ref  : 'Folder'
  },
  lastScanned  : Date,
  path         : {
    type     : String,
    default  : '',
    trim     : true,
    required : 'Path cannot be blank',
    unique   : true
  },
  title        : {
    type    : String,
    default : '',
    trim    : true
  },
  year         : Number,
  trackNumber  : Number,
  album        : {
    type    : String,
    default : '',
    trim    : true
  },
  artist       : {
    type    : String,
    default : '',
    trim    : true
  },
  genre        : {
    type    : String,
    default : '',
    trim    : true
  },
  user         : {
    type : Schema.ObjectId,
    ref  : 'User'
  }
});

mongoose.model('Track', TrackSchema);

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
  }
});

mongoose.model('Track', TrackSchema);

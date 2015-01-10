'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Album Schema
 */
var AlbumSchema = new Schema({
  created : {
    type    : Date,
    default : Date.now
  },
  name    : {
    type    : String,
    default : '',
    trim    : true
  }
});

mongoose.model('Album', AlbumSchema);

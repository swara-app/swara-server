'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Artist Schema
 */
var ArtistSchema = new Schema({
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

mongoose.model('Artist', ArtistSchema);

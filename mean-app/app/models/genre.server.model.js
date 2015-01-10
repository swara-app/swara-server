'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Genre Schema
 */
var GenreSchema = new Schema({
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

mongoose.model('Genre', GenreSchema);

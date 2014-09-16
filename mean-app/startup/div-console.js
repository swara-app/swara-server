'use strict';

var util = require('util');
var stream = require('stream');

// write to div element
var DivStream = function (opts) {
  stream.Stream.call(this);
  opts = opts || {};
  this.writable = true;
  this.readable = false;

  this.write = function (data, encoding) {
    $('#terminal').append('<p>' + data + '</p>');
  };

  this.end = function () {
  };
};
util.inherits(DivStream, stream.Stream);

// hook in our stream
process.__defineGetter__('stdout', function () {
  if (process.__stdout) return process.__stdout;
  process.__stdout = new DivStream();
  return process.__stdout;
});

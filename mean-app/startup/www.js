#!/usr/bin/env node

var debug = require('debug')('swara:www');
var app = require('../server.js');

debug('Starting the app...');
app.start();

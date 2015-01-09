'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Folder = mongoose.model('Folder');

/**
 * Globals
 */
var user, folder;

/**
 * Unit tests
 */
describe('Folder Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName   : 'Full',
      lastName    : 'Name',
      displayName : 'Full Name',
      email       : 'test@test.com',
      username    : 'username',
      password    : 'password'
    });

    user.save(function () {
      folder = new Folder({
        path : 'Folder Path',
        user : user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      return folder.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      folder.path = '';

      return folder.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Folder.remove().exec();
    User.remove().exec();
    done();
  });
});

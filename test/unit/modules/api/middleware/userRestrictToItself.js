'use strict';

var
  async          = require('async'),
  config         = require('src/config'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  userRestrictToItself = requireHelper('modules/api/middleware/userRestrictToItself').middleware;


describe('userRestrictToItself', function() {

  it('should return an error if the user is not authenticated', function(done) {
    var
      req = {},
      res = {};

    userRestrictToItself(req, res, function(err) {
      expect(err).not.to.be.undefined;
      expect(err).to.have.property('code');
      expect(err.code).to.equal(401);
      done();
    });
  });

  it('should prevent an user from accessing another user resource', function(done) {
    var
      req = {
        params: {
          id: 4
        },
        user: {
          id: 8
        }
      },
      res = {};

    userRestrictToItself(req, res, function(err) {
      expect(err).not.to.be.undefined;
      expect(err).to.have.property('code');
      expect(err.code).to.equal(401);
      done();
    });
  });


  it('should allow an user to access to his own user resource', function(done) {
    var
      req = {
        params: {
          id: 8
        },
        user: {
          id: 8
        }
      },
      res = {};

    userRestrictToItself(req, res, function(err) {
      expect(err).to.be.undefined;
      done();
    });
  });


  it('should allow an user with an ADMIN role to access to any user resource', function(done) {
    var
      req = {
        params: {
          id: 4
        },
        user: {
          id: 8,
          role: config.roles.admin
        }
      },
      res = {};

    userRestrictToItself(req, res, function(err) {
      expect(err).to.be.undefined;
      done();
    });
  });

});

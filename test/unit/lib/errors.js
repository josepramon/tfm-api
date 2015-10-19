'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  errorsLib      = requireHelper('lib/errors');


describe('lib/errors', function() {

  describe('App Error', function() {

    it('should have an error code equal to 500', function(done) {
      var err = new errorsLib.App();

      expect(err).to.have.property('code');
      expect(err.code).to.equal(500);
      done();
    });

    it('should have an error message', function(done) {
      var err = new errorsLib.App();

      expect(err).to.have.property('message');
      done();
    });

  });


  describe('NotFound Error', function() {

    it('should have an error code equal to 404', function(done) {
      var err = new errorsLib.NotFound();

      expect(err).to.have.property('code');
      expect(err.code).to.equal(404);
      done();
    });

    it('should have an error message', function(done) {
      var err = new errorsLib.NotFound();

      expect(err).to.have.property('message');
      done();
    });

  });


  describe('Unauthorized Error', function() {

    it('should have an error code equal to 401', function(done) {
      var err = new errorsLib.Unauthorized();

      expect(err).to.have.property('code');
      expect(err.code).to.equal(401);
      done();
    });

    it('should have an error message', function(done) {
      var err = new errorsLib.Unauthorized();

      expect(err).to.have.property('message');
      done();
    });

  });


  describe('Validation Error', function() {

    it('should have an error name equal to "ValidationError"', function(done) {
      var err = new errorsLib.Validation();

      expect(err).to.have.property('name');
      expect(err.name).to.equal('ValidationError');
      done();
    });

    it('should have an error message', function(done) {
      var err = new errorsLib.Validation();

      expect(err).to.have.property('message');
      done();
    });

    it('should have an errors object', function(done) {
      var
        errAttr = 'attr',
        errMsg  = 'msg',
        err     = new errorsLib.Validation(null, errAttr, errMsg);

      expect(err).to.have.property('errors');
      expect(err.errors).to.have.property(errAttr);
      expect(err.errors[errAttr]).to.have.property('path');
      expect(err.errors[errAttr]).to.have.property('message');
      expect(err.errors[errAttr].path).to.equal(errAttr);
      expect(err.errors[errAttr].message).to.equal(errMsg);
      done();
    });

  });

});

'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  httpMocks      = require('node-mocks-http'),
  requireHelper  = require('test/_util/require_helper'),

  // file being tested
  errorHandlers  = requireHelper('errorHandlers');


describe('errorHandlers', function() {

  describe('normalizeErrorCode', function() {

    it('should return the original err.code if the err object had a valid one', function(done) {
      var code = errorHandlers.normalizeErrorCode({ code: 200 });
      expect(code).to.equal(200);
      done();
    });


    it('should return the default err.code if the err object had non valid one', function(done) {
      var code = errorHandlers.normalizeErrorCode({ code: 'foo' });
      expect(code).to.equal( errorHandlers.errors.default.code );
      done();
    });


    it('should return the err.status if the err object had non valid err.code but a valid err.status', function(done) {
      var code = errorHandlers.normalizeErrorCode({ code: 'foo', status: 200 });
      expect(code).to.equal(200);
      done();
    });

  });


  describe('getPathNameFromMongoUniqueIndexError', function() {

    it('should return return an empty string if the errMessage is not valid', function(done) {
      var param = errorHandlers.getPathNameFromMongoUniqueIndexError('');
      expect(param).to.equal('');

      param = errorHandlers.getPathNameFromMongoUniqueIndexError('sjgfsdjhgfadskjf');
      expect(param).to.equal('');

      param = errorHandlers.getPathNameFromMongoUniqueIndexError('sdf.$jydsfhf');
      expect(param).to.equal('');

      done();
    });


    it('should return the model attr. that triggered the error', function(done) {
      var
        errMsg = 'E11000 duplicate key error index: dbName.collection.$foo_1 dup key: { : ObjectId(0000001), : "someValue" }',
        param  = errorHandlers.getPathNameFromMongoUniqueIndexError(errMsg);
      expect(param).to.equal('foo');

      errMsg = 'E11000 duplicate key error index: dbName.collection.$bar_-1 dup key: { : ObjectId(0000001), : "someValue" }';
      param  = errorHandlers.getPathNameFromMongoUniqueIndexError(errMsg);
      expect(param).to.equal('bar');

      done();
    });


    it('should return the model attr. that triggered the error without the owner attr. for compound keys', function(done) {
      var
        errMsg = 'E11000 duplicate key error index: dbName.collection.$owner_1_foo_1 dup key: { : ObjectId(0000001), : "someValue" }',
        param  = errorHandlers.getPathNameFromMongoUniqueIndexError(errMsg);
      expect(param).to.equal('foo');

      errMsg = 'E11000 duplicate key error index: dbName.collection.$owner_-1_bar_-1 dup key: { : ObjectId(0000001), : "someValue" }';
      param  = errorHandlers.getPathNameFromMongoUniqueIndexError(errMsg);
      expect(param).to.equal('bar');

      done();
    });

  });


  describe('middleware', function() {

    it('should return a validation error if mongo throws dupplicate index error',function(done) {

      // mock res and err objects
      var res = {
        code: null,
        data: null,
        status: function(code) {
          this.code = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      var err = {
        code: 11000,
        message: 'E11000 duplicate key error index: dbName.collection.$owner_1_foo_1 dup key: { : ObjectId(0000001), : "someValue" }'
      };

      errorHandlers.middleware(err, null, res, null);

      expect(res.code).to.equal( errorHandlers.errors.validation.code );
      expect(res.data).to.have.property('errors');
      expect(res.data.errors).to.have.property('foo');
      expect(Array.isArray(res.data.errors.foo)).to.be.true;

      // again with a malformed error message
      err = {
        code: 11000,
        message: 'E11000 duplicate key error index: dbName.collection.$dshlfjkdhk dup key: { : ObjectId(0000001), : "someValue" }'
      };

      errorHandlers.middleware(err, null, res, null);

      expect(res.code).to.equal( errorHandlers.errors.validation.code );
      expect(res.data).not.to.have.property('errors');

      done();
    });


    it('should return a generic 500 error if the error type could not be determined',function(done) {

      // mock res and err objects
      var res = {
        code: null,
        data: null,
        status: function(code) {
          this.code = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      var err = {};

      errorHandlers.middleware(err, null, res, null);
      expect(res.code).to.equal( errorHandlers.errors.default.code );
      expect(res.data.error.message).to.equal( errorHandlers.errors.default.message );
      done();
    });

  });

});

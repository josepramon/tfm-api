'use strict';

var
  async          = require('async'),
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  injectParams = requireHelper('modules/api/middleware/bodyParamsInjector').middleware;


describe('bodyParamsInjector', function() {

  it('should add some additional parameters if they don\'t exist', function(done) {

    var req = {}, params, override = false;

    async.series([
      function(cb) {
        req.body = null;
        params   = {foo: 1};

        injectParams(params, override, req, null, function() {
          expect(req.body).to.be.an('object');
          expect(req.body).to.deep.equal(params);
          cb();
        });
      },

      function(cb) {
        req.body = {foo: 2, bar: 1};
        params   = {foo: 1, qux: 2};

        injectParams(params, override, req, null, function() {
          expect(req.body).to.be.an('object');
          expect(req.body).to.deep.equal({foo: 2, bar: 1, qux: 2});
          cb();
        });
        cb();
      }
    ], function(err) {
      done();
    });

  });


  it('should replace some additional parameters if they exist', function(done) {

    var req = {}, params, override = true;

    async.series([
      function(cb) {
        req.body = null;
        params   = {foo: 1};

        injectParams(params, override, req, null, function() {
          expect(req.body).to.be.an('object');
          expect(req.body).to.deep.equal(params);
          cb();
        });
      },

      function(cb) {
        req.body = {foo: 2, bar: 1};
        params   = {foo: 1, qux: 2};

        injectParams(params, override, req, null, function() {
          expect(req.body).to.be.an('object');
          expect(req.body).to.deep.equal({foo: 1, bar: 1, qux: 2});
          cb();
        });
        cb();
      }
    ], function(err) {
      done();
    });
  });


  it('should process the parameter values before setting them', function(done) {

    var
      req     = {},
      params  = {
        foo: function(callback) {
          return callback('parsedParam');
        }
      },
      override = true;

    injectParams(params, override, req, null, function() {
      expect(req.body).to.be.an('object');
      expect(req.body).to.deep.equal({foo: 'parsedParam'});
      done();
    });
  });

});

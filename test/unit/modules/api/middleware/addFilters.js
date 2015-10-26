'use strict';

var
  async          = require('async'),
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  addFilters = requireHelper('modules/api/middleware/addFilters').middleware;


describe('addFilters', function() {

  it('should add some additional filters if they don\'t exist', function(done) {

    var req = {}, filters, override = false;

    async.series([
      function(cb) {
        req.filters = null;
        filters     = {foo: 1};

        addFilters(filters, override, req, null, function() {
          expect(req.filters).to.be.an('object');
          expect(req.filters).to.deep.equal(filters);
          cb();
        });
      },

      function(cb) {
        req.filters = {foo: 2, bar: 1};
        filters     = {foo: 1, qux: 2};

        addFilters(filters, override, req, null, function() {
          expect(req.filters).to.be.an('object');
          expect(req.filters).to.deep.equal({foo: 2, bar: 1, qux: 2});
          cb();
        });
        cb();
      }
    ], function(err) {
      done();
    });

  });


  it('should replace some additional filters if they exist', function(done) {

    var req = {}, filters, override = true;

    async.series([
      function(cb) {
        req.filters = null;
        filters     = {foo: 1};

        addFilters(filters, override, req, null, function() {
          expect(req.filters).to.be.an('object');
          expect(req.filters).to.deep.equal(filters);
          cb();
        });
      },

      function(cb) {
        req.filters = {foo: 2, bar: 1};
        filters     = {foo: 1, qux: 2};

        addFilters(filters, override, req, null, function() {
          expect(req.filters).to.be.an('object');
          expect(req.filters).to.deep.equal({foo: 1, bar: 1, qux: 2});
          cb();
        });
        cb();
      }
    ], function(err) {
      done();
    });

  });


});

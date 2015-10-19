'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  request        = require('supertest'),
  requireHelper  = require('test/_util/require_helper'),

  // server
  app            = requireHelper('app').app;




describe('Express rest api server', function() {

  describe('GET /api', function() {
    it('should respond with json', function(done) {
      request(app)
        .get('/api')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
      });
  });
});

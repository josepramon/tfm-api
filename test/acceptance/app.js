'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  request        = require('supertest'),
  requireHelper  = require('test/_util/require_helper'),

  // server
  app            = requireHelper('app').app;




describe('App', function() {

  describe('GET /', function() {

    // root route:  unused (maybe at some point it will be reenabled)

    // it('should respond with an html', function(done) {
    //   request(app)
    //     .get('/')
    //     .expect('Content-Type', /text\/html/)
    //     .expect(200, done);
    // });


    it('should throw a 404 when requesting a non existing resource', function(done) {
      request(app)
        .get('/non-existing-resource')
        .expect(404, done);
    });


  });

});

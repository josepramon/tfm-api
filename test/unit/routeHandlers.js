'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  httpMocks      = require('node-mocks-http'),
  requireHelper  = require('test/_util/require_helper'),

  // file being tested
  routeHandlers  = requireHelper('routeHandlers');




describe('RouteHandlers', function() {

  describe('#root', function() {

    it('should respond with a file', function(done) {

      var request  = httpMocks.createRequest({
        method: 'GET',
        url: '/',
      });

      var response = {};
      response.sendFile = sinon.spy();

      routeHandlers.root(request, response);

      expect(response.sendFile.calledOnce).to.be.true;

      done();
    });


  });

});

'use strict';

var
  _               = require('underscore'),

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  nestedCollectionMiddlewareBuilder = requireHelper('modules/api/util/nestedCollectionMiddlewareBuilder');


describe('modules/api/util/nestedCollectionMiddlewareBuilder', function() {

  it('should return a middleware method that accepts the standard middleware params', function(done) {

    var m = nestedCollectionMiddlewareBuilder('param', 'field');

    var
      reg = /\(([\s\S]*?)\)/,
      params = reg.exec(m),
      paramNames = [];

    if (params) {
      paramNames = params[1].split(',').map(Function.prototype.call, String.prototype.trim);
    }

    expect(paramNames.length).to.equal(3);
    expect(paramNames).to.deep.equal(['req', 'res', 'next']);
    done();
  });

  // the tests for the middleware inner workings are on
  // the /test/unit/modules/api/middleware directory, for the
  // middlewares that use this
});

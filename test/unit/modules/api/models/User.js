'use strict';

var
  // test dependencies
  mocha             = require('mocha'),
  expect            = require('chai').expect,
  requireHelper     = require('test/_util/require_helper'),

  // file being tested
  User              = requireHelper('modules/api/models/UserBase');




describe('User model', function() {

  it('should return an empty array when calling getRefs', function(done) {

    var refs = (new User()).getRefs();

    expect(Array.isArray(refs)).to.be.true;
    expect(refs.length).to.equal(1);
    done();
  });

});

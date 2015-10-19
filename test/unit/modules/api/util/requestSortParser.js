'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  requestSortParser = requireHelper('modules/api/util/requestSortParser');


describe('modules/api/util/requestSortParser', function() {

  it('should return an object with the sort keys and directions', function(done) {

    expect(requestSortParser.parse('')).to.deep.equal({});

    expect(requestSortParser.parse('foo')).to.deep.equal({
      foo: 'asc'
    });

    expect(requestSortParser.parse('foo|asc')).to.deep.equal({
      foo: 'asc'
    });

    expect(requestSortParser.parse('foo|1,bar|-1')).to.deep.equal({
      foo: 'asc',
      bar: 'desc'
    });

    done();
  });


  it('should normalize the sort order', function(done) {
    expect(requestSortParser._normalizeSortOrder('desc')).to.equal('desc');
    expect(requestSortParser._normalizeSortOrder('DESC')).to.equal('desc');
    expect(requestSortParser._normalizeSortOrder('-1')).to.equal('desc');
    expect(requestSortParser._normalizeSortOrder('asc')).to.equal('asc');
    expect(requestSortParser._normalizeSortOrder('ASC')).to.equal('asc');
    expect(requestSortParser._normalizeSortOrder('1')).to.equal('asc');

    // just some invalid values
    expect(requestSortParser._normalizeSortOrder('xxx')).to.equal('asc');
    expect(requestSortParser._normalizeSortOrder(null)).to.equal('asc');

    done();
  });

});

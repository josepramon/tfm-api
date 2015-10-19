'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,
  config          = require('src/config'),

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  Request = requireHelper('modules/api/util/Request');


describe('modules/api/util/Request', function() {

  it('should return the full requestURL', function(done) {
    // mock the req. object
    var req = {
      protocol: 'http',
      headers: {
        host: 'localhost:99'
      },
      baseUrl: '/api',
      path: '/foo'
    };

    expect((new Request(req).requestURL)).to.equal('http://localhost:99/api/foo');
    done();
  });


  it('should return the requestBaseURL (the API URL)', function(done) {
    // mock the req. object
    var req = {
      protocol: 'http',
      headers: {
        host: 'localhost:99'
      },
      baseUrl: '/api',
      path: '/foo'
    };

    expect((new Request(req).requestBaseURL)).to.equal('http://localhost:99/api');
    done();
  });


  it('should return the data owner from the authorisation', function(done) {
    // mock the req. object
    var req = {
      user: {
        userId: 1234
      }
    };

    expect((new Request(req).getOwnerFromAuth())).to.equal(1234);
    done();
  });


  it('should return an empty object if no expands are requested', function(done) {
    // mock the req. object
    var req = {
      query: {}
    };
    expect((new Request(req).getExpands())).to.deep.equal({});
    done();
  });


  it('should return the requested expands', function(done) {
    // mock the req. object
    var req = {
      query: {
        include: ['foo', 'bar']
      }
    };

    var expands = (new Request(req)).getExpands();
    expect(expands).to.have.property('foo');
    expect(expands).to.have.property('bar');
    done();
  });


  it('should limit the expands to a certain nesting level', function(done) {
    // mock the req. object
    var req = {
      query: {
        include: ['foo', 'foo.bar', 'foo.bar.baz']
      }
    },
    request = new Request(req);


    var expands1 = request.getExpands();
    expect(expands1).to.have.property('foo');
    expect(expands1).to.not.have.property('foo.bar');
    expect(expands1).to.not.have.property('foo.bar.baz');

    var expands2 = request.getExpands(2);
    expect(expands2).to.have.property('foo');
    expect(expands2).to.have.property('foo.bar');
    expect(expands2).to.not.have.property('foo.bar.baz');

    var expands3 = request.getExpands(3);
    expect(expands3).to.have.property('foo');
    expect(expands3).to.have.property('foo.bar');
    expect(expands3).to.have.property('foo.bar.baz');

    var req2 = {
      query: {
        include: ['foo.bar', 'foo.bar.baz']
      }
    };

    var expands4 = (new Request(req2)).getExpands(1);
    expect(expands4).to.not.have.property('foo.bar');
    expect(expands4).to.not.have.property('foo.bar.baz');

    done();
  });


  it('should return null if no sorting is requested', function(done) {
    expect((new Request({query: {}})._getSort())).to.be.null;
    done();
  });


  it('should return the options with some defaults', function(done) {
    var req = {query: {}};
    expect((new Request(req)).options).to.deep.equal({
      page: 1,
      limit: config.pagination.defaultLimit
    });
    done();
  });


  it('should return the options with the provided values', function(done) {
    var req = {query: { page: 4, limit: 8 }};
    expect((new Request(req)).options).to.deep.equal({
      page: 4,
      limit: 8
    });
    done();
  });


  it('should not allow a limit over the app allowed maximum', function(done) {
    var req = {query: { page: 4, limit: 8000 }};
    expect((new Request(req)).options.limit).to.equal(config.pagination.maxLimit);
    done();
  });


  it('should return the options with the sorting criterias', function(done) {
    var req = {query: { page: 1, limit: 10, sort: 'id' }};
    expect((new Request(req)).options).to.deep.equal({
      page: 1,
      limit: 10,
      sortBy: {
        id: 'asc'
      }
    });

    req = {query: { page: 1, limit: 10, sort: 'id,name|desc' }};
    expect((new Request(req)).options).to.deep.equal({
      page: 1,
      limit: 10,
      sortBy: {
        id: 'asc',
        name: 'desc'
      }
    });

    req = {query: { page: 1, limit: 10, sort: ['id','name|desc'] }};
    expect((new Request(req)).options).to.deep.equal({
      page: 1,
      limit: 10,
      sortBy: {
        id: 'asc',
        name: 'desc'
      }
    });

    done();
  });

});

'use strict';

var
  _             = require('underscore'),

  // test dependencies
  mocha         = require('mocha'),
  expect        = require('chai').expect,
  requireHelper = require('test/_util/require_helper'),

  // file to test
  expandsParser = requireHelper('modules/api/util/expandsParser'),

  // other
  config        = require('src/config');


describe('modules/api/util/expandsParser', function() {



  it('should return an empty object if there are no expands', function(done) {
    expect(expandsParser.parse()).to.deep.equal({});
    expect(expandsParser.parse(null)).to.deep.equal({});
    expect(expandsParser.parse([])).to.deep.equal({});
    done();
  });


  it('should return an object with the requested expands', function(done) {
    expect(_.keys(expandsParser.parse(['foo']))).to.deep.equal(['foo']);
    expect(_.keys(expandsParser.parse(['foo','bar']))).to.deep.equal(['foo','bar']);
    done();
  });


  it('should return some pagination defaults for the expands', function(done) {
    expect(expandsParser.parse(['foo'])).to.deep.equal({
      foo: {
        options: expandsParser.paginationDefaults
      }
    });
    done();
  });


  it('should return an object with the recognised sorting options', function(done) {
    expect(expandsParser.parse(['foo:per_page(10):sort(id)'])).to.deep.equal({
      foo: {
        options: {
          limit: 10,
          skip:  0,
          sort: { id: 'asc' }
        }
      }
    });

    expect(expandsParser.parse(['foo:page(2):per_page(4):sort(id|-1,name)'])).to.deep.equal({
      foo: {
        options: {
          limit: 4,
          skip:  4,
          sort: { id: 'desc', name: 'asc' }
        }
      }
    });

    expect(expandsParser.parse(['foo:page(1):per_page(4)', 'bar:sort(id|24)', 'baz:xxx:foobar(321131321)'])).to.deep.equal({
      foo: {
        options: {
          limit: 4,
          skip:  0
        }
      },
      bar: {
        options: {
          limit: expandsParser.paginationDefaults.limit,
          skip:  0,
          sort: { id: 'asc' }
        }
      },
      baz : {
        options: expandsParser.paginationDefaults
      }
    });

    done();
  });


  it('should not allow a limit over the app allowed maximum', function(done) {
    var parsed = expandsParser.parse(['foo:per_page(10000000)']);

    expect(parsed.foo.options.limit).to.equal(config.pagination.maxLimit);
    done();
  });

});

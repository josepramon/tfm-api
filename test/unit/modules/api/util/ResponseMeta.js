'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  ResponseMeta = requireHelper('modules/api/util/ResponseMeta');


describe('modules/api/util/ResponseMeta', function() {

  it('should return an object with an url attribute equal to the one supplied on the constructor', function(done) {
    var entityUrl = 'http://localhost/api/foo';
    var meta = (new ResponseMeta(entityUrl)).toJSON();

    expect(meta).to.have.property('url');
    expect(meta.url).to.equal(entityUrl);
    done();
  });


  it('should return an object with a "paginator" node if provided on the constructor', function(done) {
    var entityUrl = 'http://localhost/api/foo';
    var paginationOpts = {
      itemCount: 40,
      pageCount: 4,
      page:  1,
      limit: 10
    };
    var meta = (new ResponseMeta(entityUrl, paginationOpts)).toJSON();

    expect(meta).to.have.property('url');
    expect(meta).to.have.property('paginator');
    expect(meta.paginator).to.deep.equal({
      total_entries: paginationOpts.itemCount,
      total_pages:   paginationOpts.pageCount,
      page:          paginationOpts.page,
      per_page:      paginationOpts.limit
    });

    paginationOpts = {
      itemCount: 40,
      pageCount: 4,
      page:  1,
      limit: 10,
      sortBy: {id: 'asc'}
    };

    meta = (new ResponseMeta(entityUrl, paginationOpts)).toJSON();

    expect(meta.paginator).to.deep.equal({
      total_entries: paginationOpts.itemCount,
      total_pages:   paginationOpts.pageCount,
      page:          paginationOpts.page,
      per_page:      paginationOpts.limit,
      sort: {
        id: 'asc'
      }
    });

    done();
  });

});

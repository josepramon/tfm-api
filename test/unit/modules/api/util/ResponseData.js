'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  sinon           = require('sinon'),
  requireHelper   = require('test/_util/require_helper'),

  // other
  ExpandsURLMap   = require('src/modules/api/util/ExpandsURLMap'),

  // file to test
  ResponseData = requireHelper('modules/api/util/ResponseData');


describe('modules/api/util/ResponseData', function() {


  it('should store the data', function(done) {
    var data = { a: 1, b: 2 };
    var responseData = new ResponseData();

    responseData.setData(data);
    expect(responseData.data).to.deep.equal(data);
    done();
  });


  it('should return an empty object if there is no data', function(done) {
    expect( (new ResponseData()).toJSON() ).to.deep.equal({});
    done();
  });


  describe('_formatItem', function() {

    it('should should expand the requested attributes', function(done) {
      var r = new ResponseData();
      // override the methods '_getNestedMeta' and '_formatNestedData'
      // because that is not being tested here
      r._getNestedMeta    = function() { return {}; };
      r._formatNestedData = function(data) { return data; };

      // mock a model instance
      var item = {
        foo: { aaa: 1, bbb: 2 },
        bar: 4,
        getRefs: function() { return ['foo']; },
        toJSON: function() {
          return {
            foo: { aaa: 1, bbb: 2 },
            bar: 4
          };
        }
      };

      var result = r._formatItem(item, {foo: {}});

      expect(result).to.deep.equal({
        foo: {
          meta: {},
          data: { aaa: 1, bbb: 2 }
        },
        bar: 4
      });

      // another test
      item = {
        foo: { aaa: 1, bbb: 2 },
        bar: 4,
        baz: { aaa: 1, bbb: 2 },
        getRefs: function() { return ['foo', 'baz']; },
        toJSON: function() {
          return {
            foo: { aaa: 1, bbb: 2 },
            bar: 4,
            baz: { aaa: 1, bbb: 2 }
          };
        }
      };

      result = r._formatItem(item, {foo: {}});

      expect(result).to.deep.equal({
        bar: 4,
        baz: { meta: {} },
        foo: {
          meta: {},
          data: { aaa: 1, bbb: 2 }
        },
      });

      // another test
      item = {
        foo: { aaa: 1, bbb: 2 },
        bar: 4,
        baz: { aaa: 1, bbb: 2 },
        toJSON: function() {
          return {
            foo: { aaa: 1, bbb: 2 },
            bar: 4,
            baz: { aaa: 1, bbb: 2 }
          };
        }
      };

      result = r._formatItem(item);

      expect(result).to.deep.equal({
        bar: 4,
        baz: { aaa: 1, bbb: 2 },
        foo: { aaa: 1, bbb: 2 }
      });

      done();
    });


  });


  describe('_formatNestedData', function() {
    var respData, formatItemStub;

    before(function(done) {
      respData = new ResponseData();
      formatItemStub = sinon.stub(respData, '_formatItem').returns({foo:1});
      done();
    });


    beforeEach(function(done) {
      formatItemStub.reset();
      done();
    });


    it('should call _formatItem once if a single data item is provided', function(done) {
      var data = {bar:2};
      var formattedData = respData._formatNestedData(data);

      expect(formatItemStub.calledOnce).to.be.true;
      expect(formattedData).to.deep.equal({ foo: 1 });
      done();
    });


    it('should call _formatItem multiple times if a data array is provided', function(done) {
      var data = [{bar:2}, {bar:3}];
      var formattedData = respData._formatNestedData(data);

      expect(formatItemStub.calledTwice).to.be.true;
      expect(formattedData).to.deep.equal([{ foo: 1 }, { foo: 1 }]);
      done();
    });
  });


  describe('_getNestedMeta', function() {
    var data = {
      foo: null,
      bar: 'xxx',
      baz: [1,2,3,4],
      populated() {
        return false;
      }
    };


    it('should return the item count if there is no pagination', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));

      expect( respData._getNestedMeta(data,['nonExisting'], null) ).to.deep.equal({ url: '', count: 0 });
      expect( respData._getNestedMeta(data,['foo'], null) ).to.deep.equal({ url: '', count: 0 });
      expect( respData._getNestedMeta(data,['bar'], null) ).to.deep.equal({ url: '', count: 1 });
      expect( respData._getNestedMeta(data,['baz'], null) ).to.deep.equal({ url: '', count: 4 });

      done();
    });


    it('should not return the item count if there is pagination', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var stub = sinon.stub(respData, '_getNestedMetaPaginationOptions').returns({foo:1});
      var nestedMeta = respData._getNestedMeta(data,['foo'], null);
      expect(nestedMeta).to.not.have.property('count');
      expect(nestedMeta).to.have.property('paginator');
      done();
    });

  });


  describe('_getNestedMetaUrl', function() {

    it('should return an ampty string if there is no nodeRoute', function(done) {
      var respData = new ResponseData('http://localhost', null, null);
      expect(respData._getNestedMetaUrl()).to.equal('');
      done();
    });


    it('should return the nodeRoute prefixed with the base url', function(done) {
      var respData = new ResponseData('http://localhost', null, null);
      expect(respData._getNestedMetaUrl(null,null,'/foo')).to.equal('http://localhost/foo');
      done();
    });


    it('should return the url with the parentId', function(done) {
      var respData = new ResponseData('http://localhost', null, null);
      var route = '/foo/:parentId/bar';
      var parent, node;

      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('');

      parent = {};
      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('');

      parent = { _id: 1 };
      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('http://localhost/foo/1/bar');

      parent = { _id: objectid('000000000000000000000001') };
      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('http://localhost/foo/000000000000000000000001/bar');

      done();
    });


    it('should return the url with the itemId', function(done) {
      var respData = new ResponseData('http://localhost', null, null);
      var route = '/foo/:itemId';
      var parent, node;

      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('');

      node = {};
      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('');

      node = { _id: 1 };
      expect(respData._getNestedMetaUrl(parent, node, route)).to.equal('http://localhost/foo/1');

      done();
    });

  });


  describe('_getNestedMetaPaginationOptions', function() {

    it('should return null if the attribute does not exist in the expands object', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var pagination1 = respData._getNestedMetaPaginationOptions(null, null, 0);
      var pagination2 = respData._getNestedMetaPaginationOptions({foo:null}, 'bar', 0);

      expect(pagination1).to.be.null;
      expect(pagination2).to.be.null;
      done();
    });


    it('should return null if the attribute does not have pagination options', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var pagination = respData._getNestedMetaPaginationOptions({foo:null}, 'foo', 0);

      expect(pagination).to.be.null;
      done();
    });


    it('should return the pagination data', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var expandOpts = { limit: 10, skip: 5 };
      var totalItems = 20;
      var pagination = respData._getNestedMetaPaginationOptions({foo:{options: expandOpts}}, 'foo', totalItems);

      expect(pagination).to.not.be.null;
      expect(pagination).to.have.property('itemCount');
      expect(pagination).to.have.property('pageCount');
      expect(pagination).to.have.property('limit');
      expect(pagination).to.have.property('page');
      expect(pagination).to.not.have.property('sortBy');

      expect(pagination.itemCount).to.equal(totalItems);
      expect(pagination.pageCount).to.equal(Math.ceil(totalItems/expandOpts.limit));
      expect(pagination.limit).to.equal(expandOpts.limit);
      expect(pagination.page).to.equal(expandOpts.skip/expandOpts.limit+1);
      done();
    });


    it('should return the pagination data with the sorting options', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var expandOpts = { limit: 10, skip: 5, sort: {id: 'asc'} };
      var totalItems = 20;
      var pagination = respData._getNestedMetaPaginationOptions({foo:{options: expandOpts}}, 'foo', totalItems);

      expect(pagination).to.have.property('sortBy');
      expect(pagination.sortBy).to.deep.equal(expandOpts.sort);
      done();
    });

  });


  describe('_getNestedExpands', function() {

    it('should return an empty object if there are no sutiable expands', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var attr = 'foo';
      var expands = {};
      expect(respData._getNestedExpands(attr, expands)).to.deep.equal({});

      expands = {bar: {}};
      expect(respData._getNestedExpands(attr, expands)).to.deep.equal({});
      done();
    });


    it('should return the expands for some attribute', function(done) {
      var respData = new ResponseData('', {}, new ExpandsURLMap({}));
      var attr = 'foo';
      var expands = { foo: {}, bar: {}, 'foo.bar': {}, 'foo.bar.baz': {} };
      var nestedExpands = respData._getNestedExpands(attr, expands);
      expect(_.keys(nestedExpands)).to.deep.equal(['foo.bar','foo.bar.baz']);
      done();
    });

  });

});

'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  articleTagsMiddleware = requireHelper('modules/api/modules/knowledge_base/middleware/articleTags');


describe('modules/api/modules/knowledge_base/middleware/articleTags', function() {

  it('should do nothing if there is no tagId param', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1
      },
      body: {}
    };

    articleTagsMiddleware(req, null, function() {
      expect(req.body).to.not.have.property('tags');
      done();
    });
  });


  it('should do nothing if the tags passed in the request body are not a valid JSON string', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        tagId: 2
      },
      body: {
        tags: 'foobar'
      }
    };

    articleTagsMiddleware(req, null, function() {
      expect(req.body.tags).to.equal('foobar');
      done();
    });
  });


  it('should add a tag object to the request body if the tagId param is present', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        tagId: 2
      },
      body: {}
    };

    articleTagsMiddleware(req, null, function() {
      expect(req.body).to.have.property('tags');
      expect(req.body.tags).to.be.a.string;

      var tags = JSON.parse(req.body.tags);
      expect(tags.length).to.equal(1);
      expect(tags[0]).to.deep.equal({id: 2});
      done();
    });
  });


  it('should add the tag object to the other tags passed in the request body', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        tagId: 2
      },
      body: {
        tags: '{"name":"foo"}'
      }
    };

    articleTagsMiddleware(req, null, function() {
      expect(req.body).to.have.property('tags');
      expect(req.body.tags).to.be.a.string;

      var tags = JSON.parse(req.body.tags);
      expect(tags.length).to.equal(2);
      expect(tags).to.deep.equal([{ 'name': 'foo' }, { 'id': 2 }]);
      done();
    });
  });

});

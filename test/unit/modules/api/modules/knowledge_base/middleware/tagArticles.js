'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  tagArticlesMiddleware = requireHelper('modules/api/modules/knowledge_base/middleware/tagArticles');


describe('modules/api/modules/knowledge_base/middleware/tagArticles', function() {

  it('should do nothing if there is no articleId param', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1
      },
      body: {}
    };

    tagArticlesMiddleware(req, null, function() {
      expect(req.body).to.not.have.property('articles');
      done();
    });
  });


  it('should do nothing if the articles passed in the request body are not a valid JSON string', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        articleId: 2
      },
      body: {
        articles: 'foobar'
      }
    };

    tagArticlesMiddleware(req, null, function() {
      expect(req.body.articles).to.equal('foobar');
      done();
    });
  });


  it('should add an article object to the request body if the articleId param is present', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        articleId: 2
      },
      body: {}
    };

    tagArticlesMiddleware(req, null, function() {
      expect(req.body).to.have.property('articles');
      expect(req.body.articles).to.be.a.string;

      var articles = JSON.parse(req.body.articles);
      expect(articles.length).to.equal(1);
      expect(articles[0]).to.deep.equal({id: 2});
      done();
    });
  });


  it('should add the tag object to the other tags passed in the request body', function(done) {
    // mock the request
    var req = {
      params: {
        id: 1,
        articleId: 2
      },
      body: {
        articles: '{"id":8}'
      }
    };

    tagArticlesMiddleware(req, null, function() {
      expect(req.body).to.have.property('articles');
      expect(req.body.articles).to.be.a.string;

      var articles = JSON.parse(req.body.articles);
      expect(articles.length).to.equal(2);
      expect(articles).to.deep.equal([{ 'id': 8 }, { 'id': 2 }]);
      done();
    });
  });

});

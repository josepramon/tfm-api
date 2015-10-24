'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  mockery        = require('mockery'),
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  TagsController;


describe('TagsController', function() {

  var ArticleTagsUtilStub, ArticleTagsUtilSpy;

  before(function(done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    ArticleTagsUtilStub = {};
    ArticleTagsUtilStub.setTagArticles = function(model, tags, next) {
      next(null, model);
    };
    ArticleTagsUtilSpy = sinon.spy(ArticleTagsUtilStub, 'setTagArticles');

    mockery.registerMock('../util/ArticleTagsUtil', ArticleTagsUtilStub);

    // must be loaded after mocking ArticleTagsUtil
    TagsController = requireHelper('modules/api/modules/knowledge_base/controllers/TagsController');

    done();
  });


  beforeEach(function(done) {
    ArticleTagsUtilSpy.reset();
    done();
  });


  after(function(done) {
    mockery.deregisterAll();
    mockery.disable();

    // reload
    TagsController = requireHelper('modules/api/modules/knowledge_base/controllers/TagsController');
    done();
  });


  describe('_buildWaterfallOptions', function() {

    it('should return an empty object if called without params', function(done) {
      var controller = new TagsController();

      var opts = controller._buildWaterfallOptions();
      expect(opts).to.deep.equal({});
      done();
    });


    it('should add a slug property if the param is not undefined', function(done) {
      var controller = new TagsController();

      var opts1 = controller._buildWaterfallOptions(null);
      expect(opts1).to.have.property('slug');
      expect(opts1.slug).to.be.null;

      var opts2 = controller._buildWaterfallOptions('foo');
      expect(opts2).to.have.property('slug');
      expect(opts2.slug).to.equal('foo');
      done();
    });

    it('should add a articles property if the param is not undefined', function(done) {
      var controller = new TagsController();

      var opts1 = controller._buildWaterfallOptions(undefined, null);
      expect(opts1).to.have.property('articles');
      expect(opts1.articles).to.be.null;

      var opts2 = controller._buildWaterfallOptions(undefined, 'foo');
      expect(opts2).to.have.property('articles');
      expect(opts2.articles).to.equal('foo');
      done();
    });

  });


  describe('_setArticles', function() {

    it('should return a validation error if a string is supplied and it\'s not a valid JSON', function(done) {
      (new TagsController())._setArticles({}, { articles: 'some-random-string' }, function(err, model, options) {
        expect(err).to.not.be.null;
        expect(err.name).to.equal('ValidationError');
        done();
      });
    });

    it('should call the callback with the supplied arguments if thre are no tags in the option object', function(done) {
      var
        modelParam = {},
        optionsParam = {foo:'bar'};

      (new TagsController())._setArticles(modelParam, optionsParam, function(err, model, options) {
        expect(ArticleTagsUtilSpy.called).to.be.false;
        expect(modelParam).to.deep.equal(model);
        expect(optionsParam).to.deep.equal(options);
        done();
      });
    });

    it('should accept a single tag', function(done) {
      (new TagsController())._setArticles({}, { articles: {id: 1234} }, function(err, model, options) {
        expect(ArticleTagsUtilSpy.called).to.be.true;
        done();
      });
    });

    it('should accept an array of tags tag', function(done) {
      (new TagsController())._setArticles({}, { articles: [{id: 1234},{id: 4567}] }, function(err, model, options) {
        expect(ArticleTagsUtilSpy.called).to.be.true;
        done();
      });
    });

    it('should accept an JSON string', function(done) {
      (new TagsController())._setArticles({}, { articles: '[{"id": 1234},{"id": 4567}]' }, function(err, model, options) {
        expect(ArticleTagsUtilSpy.called).to.be.true;
        done();
      });
    });

  });

});

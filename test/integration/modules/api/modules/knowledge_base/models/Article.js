'use strict';

var
  async             = require('async'),
  db                = require('test/_util/db'),

  // test dependencies
  mocha             = require('mocha'),
  expect            = require('chai').expect,
  faker             = require('faker'),
  id                = require('pow-mongodb-fixtures').createObjectId,
  requireHelper     = require('test/_util/require_helper'),

  // file being tested
  Article           = requireHelper('modules/api/modules/knowledge_base/models/Article'),

  // other
  Tag               = require('src/modules/api/modules/knowledge_base/models/Tag');



describe('Knowledge Base Article model', function() {

  this.timeout(10000);

  before(function(done) {
    db.connect(done);
  });


  after(function(done) {
    db.disconnect(done);
  });


  it('should save the article', function(done) {
    var defaultUserId = id('000000000000000000000001');
    var articleData = {
      title:   faker.lorem.sentence(),
      body:    faker.lorem.paragraphs(2),
      slug:    'some-random-slug-98735353445'
    };

    var article = new Article(articleData);

    article.save(function(err, article) {
      expect(article.title).to.equal(articleData.title);
      expect(article.body).to.equal(articleData.body);
      article.remove(done);
    });
  });


  it('should transform the virtual attributes when /saving/fetching', function(done) {
    var defaultUserId = id('000000000000000000000001');
    var articleData = {
      title:        faker.lorem.sentence(),
      body:         faker.lorem.paragraphs(2),
      published_at: new Date()
    };

    var article = new Article(articleData);

    article.save(function(err, article) {
      var articleJSON = article.toJSON();

      expect(articleJSON).to.have.property('id');
      expect(articleJSON).to.not.have.property('_id');
      expect(articleJSON.created_at).to.match(/^\d{10}$/);
      expect(articleJSON.updated_at).to.match(/^\d{10}$/);
      expect(articleJSON.publish_date).to.match(/^\d{10}$/);
      article.remove(done);
    });
  });


  it('should unlink linked tags when deleting', function(done) {
    var tag, article;

    async.series([
      function(cb) {  // create a tag
        tag = new Tag({
          name:  'someRandomTag1321322',
          slug:  'someRandomTag1321322'
        });
        tag.save(cb);
      },

      function(cb) {  // create an article and link it
        article = new Article({
          title:   faker.lorem.sentence(),
          body:    faker.lorem.paragraphs(2),
          slug:    'some-random-slug-5464654654654',
          tags:    [tag._id]
        });

        article.save(function(err) {
          if(err) { return cb(err); }
          tag.articles = [article._id];
          tag.save(cb);
        });
      },

      function(cb) {  // delete the article
        article.remove(cb);
      }
    ], function(err) { // check the tag
      Tag.findOne({slug: tag.slug}, function(err, model) {
        expect(model.articles.length).to.equal(0);
        model.remove(done);
      });
    });
  });

});

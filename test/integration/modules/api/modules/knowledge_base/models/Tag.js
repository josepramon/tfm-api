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
  Tag               = requireHelper('modules/api/modules/knowledge_base/models/Tag'),

  // other
  Article           = require('src/modules/api/modules/knowledge_base/models/Article');




describe('Knowledge Base Tag model', function() {

  this.timeout(10000);

  before(function(done) {
    db.connect(done);
  });


  after(function(done) {
    db.disconnect(done);
  });


  it('should save the tag', function(done) {
    var
      defaultUserId = id('000000000000000000000001'),
      name = faker.lorem.words(1).join(),
      tagData = {
        name:        name,
        slug:        name,
        description: faker.lorem.paragraph(),
        owner:       defaultUserId
      };

    var tag = new Tag(tagData);

    tag.save(function(err, tag) {
      expect(tag.name).to.equal(tagData.name);
      expect(tag.description).to.equal(tagData.description);
      tag.remove(done);
    });
  });


  it('should transform the virtual attributes when /saving/fetching', function(done) {
    var
      defaultUserId = id('000000000000000000000001'),
      name = faker.lorem.words(1).join(),
      tagData = {
        name:        name,
        slug:        name,
        description: faker.lorem.paragraph(),
        owner:       defaultUserId
      };

    var tag = new Tag(tagData);

    tag.save(function(err, tag) {
      var tagJSON = tag.toJSON();

      expect(tagJSON).to.have.property('id');
      expect(tagJSON).to.not.have.property('_id');
      expect(tagJSON.created_at).to.match(/^\d{10}$/);
      expect(tagJSON.updated_at).to.match(/^\d{10}$/);
      tag.remove(done);
    });
  });


  it('should unlink tagged articles when deleting', function(done) {
    var tag, article, ownerId = id('000000000000000000000001');

    async.series([
      function(cb) {  // create a tag
        tag = new Tag({
          name:  'someRandomTag5646445',
          slug:  'someRandomTag5646445',
          owner: ownerId
        });
        tag.save(cb);
      },

      function(cb) {  // create an article and link it
        article = new Article({
          title:   faker.lorem.sentence(),
          body:    faker.lorem.paragraphs(2),
          slug:    'some-random-slug-45454545454',
          author:  ownerId,
          owner:   ownerId,
          tags:    [tag._id]
        });

        article.save(function(err) {
          if(err) { return cb(err); }
          tag.articles = [article._id];
          tag.save(cb);
        });
      },

      function(cb) {  // delete the tag
        tag.remove(cb);
      }
    ], function(err) { // check the article
      Article.findOne({slug: article.slug}, function(err, model) {
        expect(model.tags.length).to.equal(0);
        model.remove(done);
      });
    });
  });

});

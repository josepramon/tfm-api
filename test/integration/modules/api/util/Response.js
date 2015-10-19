'use strict';

var
  _                 = require('underscore'),
  objectid          = require('mongodb').ObjectID,
  db                = require('test/_util/db'),

  // test dependencies
  mocha             = require('mocha'),
  expect            = require('chai').expect,
  requireHelper     = require('test/_util/require_helper'),

  // other
  Article           = require('src/modules/api/models/blog/Article'),
  ExpandsURLMap     = require('src/modules/api/util/ExpandsURLMap'),

  // file to test
  Response = requireHelper('modules/api/util/Response');


describe('modules/api/util/Response', function(done) {

  var existingArticle;

  before(function(done) {
    db.connect(function() {
      existingArticle = new Article({
        title:  'some-new-article-1',
        slug:   'some-new-article-1',
        owner:  objectid('000000000000000000000001'),
        author: objectid('000000000000000000000001'),
      });

      existingArticle.save(function(err) {
        if(err) {
          console.log(err);
        }
        done();
      });
    });
  });


  after(function(done) {
    existingArticle.remove(function() {
      db.disconnect(done);
    });
  });


  it('should expand the data', function(done) {
    var response = new Response(null, new ExpandsURLMap());

    response._expandData(existingArticle, ['author'], function(err, data) {
      expect(err).to.be.null;
      done();
    });
  });

});

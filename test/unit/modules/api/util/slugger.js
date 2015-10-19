'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  slugger        = requireHelper('modules/api/util/slugger');


describe('modules/api/util/slugger', function() {

  it('should return an error if no model is supplied', function(done) {
    slugger(null, 'The title', 'a slug', function(err, slug) {
      expect(err).to.not.be.null;
      done();
    });
  });


  it('should return an error if no attributes are supplied', function(done) {
    // mock the model
    var Model = {
      data: [
        { slug: 'a-slug' },
      ],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, null, null, function(err, slug) {
      expect(err).to.not.be.null;
      done();
    });
  });


  it('should return the provided slug if there are no other models with that slug', function(done) {

    // mock the model
    var Model = {
      data: [],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, 'The title', 'a slug', function(err, slug) {
      expect(slug).to.equal('a-slug');
      done();
    });
  });


  it('should return the provided slug with a numeric suffix if there are already other models with that slug', function(done) {

    // mock the model
    var Model = {
      data: [
        { slug: 'a-slug' }
      ],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, 'The title', 'a slug', function(err, slug) {
      expect(slug).to.equal('a-slug-1');
    });

    Model = {
      data: [
        { slug: 'a-slug' },
        { slug: 'a-slug-1' }
      ],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, 'The title', 'a slug', function(err, slug) {
      expect(slug).to.equal('a-slug-2');
    });

    done();
  });


  it('should return the provided slug if there are other models with that slug and a suffix', function(done) {

    // mock the model
    var Model = {
      data: [
        { slug: 'a-slug-1' },
        { slug: 'a-slug-4' }
      ],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, 'The title', 'a slug', function(err, slug) {
      expect(slug).to.equal('a-slug');
    });

    done();
  });


  it('should return the provided slugged title if no slug is provided', function(done) {

    // mock the model
    var Model = {
      data: [],
      find: function(search, cb) { cb(null, this.data); }
    };

    slugger(Model, 'The title', null, function(err, slug) {
      expect(slug).to.equal('The-title');
      done();
    });
  });

});

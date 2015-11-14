'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  TagsUtil        = requireHelper('modules/api/modules/knowledge_base/util/TagsUtil');


describe('modules/api/modules/knowledge_base/util/TagsUtil', function() {

  describe('_getObjId', function() {

    it('should return the object id if the object is a raw mongo id', function(done) {
      var
        obj = objectid('000000000000000000000001'),
        id  = TagsUtil._getObjId(obj);

      expect(id).to.equal('000000000000000000000001');
      done();
    });

    it('should return the object id if the supplied object has an id attribute', function(done) {
      var
        obj = { id: 1234, name: 'whatever' },
        id  = TagsUtil._getObjId(obj);

      expect(id).to.equal(1234);
      done();
    });

    it('should return undefined if the object does not have an id attribute', function(done) {
      var
        obj = {name: 'whatever' },
        id  = TagsUtil._getObjId(obj);

      expect(id).to.be.undefined;
      done();
    });

  });

});

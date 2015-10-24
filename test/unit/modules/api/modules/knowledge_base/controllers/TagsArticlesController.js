'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  TagsArticlesController = requireHelper('modules/api/modules/knowledge_base/controllers/TagsArticlesController');

describe('TagsArticlesController', function() {

  it('should inject the articleId to the db criteria', function(done) {
    var controller = new TagsArticlesController();

    // mock the request
    var request = {
      req: {
        params: {
          id: 1,
          tagId: 2
        }
      }
    };

    var criteria = controller._buildCriteria(request);

    expect(criteria).to.deep.equal({_id: 1, tags: 2});

    done();
  });

});

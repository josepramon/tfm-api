'use strict';

var
  // generic stuff
  _                  = require('underscore'),

  // API utilities
  ExpandsURLMap      = require('../../../util/ExpandsURLMap'),

  // Base class
  ArticlesController = require('./ArticlesController');


/**
 * TagsArticlesController
 */
class TagsArticlesController extends ArticlesController
{
  constructor() {
    super();
  }


  // Aux. "private" methods
  // (actually they're not private so can be easily tested)
  // =============================================================================

  _buildCriteria(request) {
    var criteria = super._buildCriteria(request);

    /* istanbul ignore else */
    if(request.req.params.tagId) {
      criteria.tags = request.req.params.tagId;
    }

    return criteria;
  }

}


module.exports = TagsArticlesController;

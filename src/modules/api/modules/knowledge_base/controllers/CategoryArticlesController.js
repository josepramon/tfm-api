'use strict';

var
  // generic stuff
  _                  = require('underscore'),

  // API utilities
  ExpandsURLMap      = require('../../../util/ExpandsURLMap'),

  // Base class
  ArticlesController = require('./ArticlesController');


/**
 * CategoryArticlesController
 */
class CategoryArticlesController extends ArticlesController
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
      criteria.category = request.req.params.categoryId;
    }

    return criteria;
  }

}


module.exports = CategoryArticlesController;

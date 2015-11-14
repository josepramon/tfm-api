'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),

  apiBasePath     = '../../..',
  moduleBasePath  = '..',

  // API utilities
  Request         = require(apiBasePath + '/util/Request'),
  Response        = require(apiBasePath + '/util/Response'),
  ExpandsURLMap   = require(apiBasePath + '/util/ExpandsURLMap'),

  // Base class
  TagsController  = require(moduleBasePath + '/controllers/TagsController'),

  // Model managed by this controller
  Category        = require(moduleBasePath + '/models/Category');


/**
 * Categories Controller
 *
 * It works almost exactly as the TagsController
 */
class CategoriesController extends TagsController
{
  constructor() {
    super();

    /**
     * @type {Model}
     */
    this.Model = Category;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({
      "articles": {
        "route": "/knowledge_base/categories/:parentId/articles",
        "expands": {
          "tags": {
            "route": "/knowledge_base/articles/:parentId/tags",
            "expands": {
              "articles": {
                "route": "/knowledge_base/tags/:parentId/articles"
              }
            }
          },
          "category": {
            "route": "/knowledge_base/categories/:itemId"
          }
        }
      }
    });
  }

}


module.exports = CategoriesController;

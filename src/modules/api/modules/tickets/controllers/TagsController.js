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
  filters         = require(apiBasePath + '/util/filters'),

  // Base class
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Tag             = require(moduleBasePath + '/models/Tag');


/**
 * Tags Controller
 */
class TagsController extends BaseController
{
  constructor() {
    super();

    /**
     * @type {Model}
     */
    this.Model = Tag;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({
      "articles": {
        "route": "/knowledge_base/tags/:parentId/articles",
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


  /**
   * Create a new Tag
   */
  create(req, res, next) {
    var
      Model    = this.Model,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new Model(newAttrs);
        callback(null, model, {});
      },
      this._validate,
      this._save

    ], function asyncComplete(err, model) {

      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }


  /**
   * Update a Tag
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      Model    = this.Model,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch);

    async.waterfall([
      function setup(callback) {
        Model.findOne(criteria).exec(function(err, tagModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!tagModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          tagModel.set(newAttrs);

          callback(null, tagModel, {});
        });
      },
      this._validate,
      this._save

    ], function asyncComplete(err, model) {

      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }

}


module.exports = TagsController;

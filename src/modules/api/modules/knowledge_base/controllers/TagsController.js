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
  slugger         = require(apiBasePath + '/util/slugger'),
  filters         = require(apiBasePath + '/util/filters'),
  ArticlesUtil    = require(moduleBasePath + '/util/ArticlesUtil'),

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

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(null, req.body.articles),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new Model(newAttrs);
        callback(null, model, waterfallOptions);
      },
      this._validate,
      this._setSlug.bind(this),
      this._setArticles,
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

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body.slug, req.body.articles),

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

          // if doing a full update, make sure the values are reset if there's no data
          if(!patch) {
            if(!req.body.slug) {
              tagModel.set({slug: undefined});
            }

            /* istanbul ignore next */
            if(!req.body.articles) {
              tagModel.articles = [];
            }
          }

          callback(null, tagModel, waterfallOptions);
        });
      },
      this._validate,
      this._setSlug.bind(this),
      this._setArticles,
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



  // Aux. "private" methods
  // (actually they're not private so can be easily tested)
  // =============================================================================

  _buildWaterfallOptions(slug, articles) {
    var options = {};
    if(!_.isUndefined(slug))     { options.slug = slug; }
    if(!_.isUndefined(articles)) { options.articles = articles; }
    return options;
  }


  /**
   * Filters parsing for the queryes
   *
   * The requests might contain filters like
   * `?filter=filterName:params,anotherFilterName:params`
   * to limit the results.
   *
   * By default, the method defined on the BaseController allows filtering
   * on the model 'safe' attributes.
   *
   * Define some additional filters.
   */
  _parseFilters(request) {
    var
      that           = this,
      multiRelationFilters = {
        articles:    'articles',
        hasArticles: 'articles'
      },
      defaultFilters = super._parseFilters(request);

    var additionalFilters = _.reduce(multiRelationFilters, function(memo, attribute, filterName) {
      return _.extend(memo, filters.getRelationSizeFilter(request.filters, filterName, attribute));
    }, {});

    // if there's any filter for the nested collections, enable it
    // this is a special filter, because it is not applied to the initial query,
    // but instead in the relations population
    if(_.has(request.filters, 'articles.isPublished')) {
      filters.setNestedArticlesPublishedFilter({isPublished: request.filters['articles.isPublished']}, request);
    }

    return _.extend({}, defaultFilters, additionalFilters);
  }


  _setSlug(model, options, callback) {
    if(_.isUndefined(options.slug) || model.slug === options.slug) {
      callback(null, model, options);
    } else {
      slugger(this.Model, model.name, options.slug, function(err, tagSlug) {
        /* istanbul ignore next */
        if (err) { return callback(err); }

        model.slug = tagSlug;
        callback(null, model, options);
      });
    }
  }


  _setArticles(model, options, callback) {
    if(_.isUndefined(options.articles)) {
      callback(null, model, options);
    } else {
      let articles = options.articles;

      if(!_.isObject(articles)) {
        try {
          articles = JSON.parse(articles);
        } catch(e) {
          return callback( errors.Validation(model, 'articles', 'Articles must be a valid JSON') );
        }
      }

      ArticlesUtil.setArticles(model, articles, function(err, model) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        callback(null, model, options);
      });
    }
  }

}


module.exports = TagsController;

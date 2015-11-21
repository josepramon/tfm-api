'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),
  objectid        = require('mongodb').ObjectID,

  apiBasePath     = '../../..',
  moduleBasePath  = '..',

  // API utilities
  Request         = require(apiBasePath + '/util/Request'),
  Response        = require(apiBasePath + '/util/Response'),
  ExpandsURLMap   = require(apiBasePath + '/util/ExpandsURLMap'),
  slugger         = require(apiBasePath + '/util/slugger'),
  filters         = require(apiBasePath + '/util/filters'),

  // utilities to manage the bidirectional relations
  CategoryUtil    = require(moduleBasePath + '/util/CategoryUtil'),
  TagsUtil        = require(moduleBasePath + '/util/TagsUtil'),

  // Base class
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Article = require(moduleBasePath + '/models/Article');


/**
 * ArticlesController
 */
class ArticlesController extends BaseController
{
  constructor() {
    super();
    /**
     * @type {Model}
     */
    this.Model = Article;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({
      "category": {
        "route": "/knowledge_base/categories/:itemId",
        "expands": {
          "articles": {
            "route": "/knowledge_base/categories/:parentId/articles",
            "expands": {
              "tags": {
                "route": "/knowledge_base/articles/:parentId/tags"
              },
              "category": {
                "route": "/knowledge_base/categories/:itemId"
              }
            }
          }
        }
      },
      "tags": {
        "route": "/knowledge_base/articles/:parentId/tags",
        "expands": {
          "articles": {
            "route": "/knowledge_base/tags/:parentId/articles",
            "expands": {
              "tags": {
                "route": "/knowledge_base/articles/:parentId/tags"
              },
              "category": {
                "route": "/knowledge_base/categories/:itemId"
              }
            }
          }
        }
      },
    });
  }


  /**
   * Create a new Article
   */
  create(req, res, next) {
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(null, req.body.tags, req.body.category, req.body.attachments),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new Article(newAttrs);

        /* istanbul ignore next */
        if(req.body.author_id) { model.author = req.body.author_id; }

        callback(null, model, waterfallOptions);
      },
      this._setAttachments,
      this._validate,
      this._setSlug,
      this._setCategory,
      this._setTags,
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
   * Update an Article
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body.slug, req.body.tags, req.body.category, req.body.attachments),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch);

    async.waterfall([
      function setup(callback) {
        Article.findOne(criteria).exec(function(err, articleModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!articleModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          articleModel.set(newAttrs);

          /* istanbul ignore next */
          if(req.body.author_id || !patch) {
            articleModel.set({author: req.body.author_id});
          }

          // if doing a full update, make sure the values are reset if there's no data
          if(!patch) {
            if(!req.body.slug) {
              articleModel.set({slug: undefined});
            }

            /* istanbul ignore next */
            if(!req.body.tags) { waterfallOptions.tags = []; }

            /* istanbul ignore next */
            if(!req.body.category) { waterfallOptions.category = null; }
          }

          callback(null, articleModel, waterfallOptions);
        });
      },
      this._setAttachments,
      this._validate,
      this._setSlug,
      this._setCategory,
      this._setTags,
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

  /**
   * Filters parsing for the querys
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
      that = this,

      multiRelationFilters = {
        tags:        'tags',
        hasTags:     'tags'
      },

      singleRelationFilters = {
        hasCategory: 'category'
      },

      // get the regular filters (on safe attributes)
      defaultFilters = super._parseFilters(request);

    // get any filters applied on relations (based on the presence of them or its size)
    var additionalFilters = _.reduce(multiRelationFilters, function(memo, attribute, filterName) {
      return _.extend(memo, filters.getRelationSizeFilter(request.filters, filterName, attribute));
    }, {});

    additionalFilters = _.reduce(singleRelationFilters, function(memo, attribute, filterName) {
      return _.extend(memo, filters.hasRelationFilter(request.filters, filterName, attribute));
    }, additionalFilters);

    // add the isPublished filter (based on the published attribute and the publish date)
    if(_.has(request.filters, 'isPublished')) {
      additionalFilters = _.extend(additionalFilters, filters.getPublishedFilter(request.filters));
    }

    return _.extend({}, defaultFilters, additionalFilters);
  }


  _buildWaterfallOptions(slug, tags, category, attachments) {
    var options = {};
    if(!_.isUndefined(slug))        { options.slug = slug; }
    if(!_.isUndefined(tags))        { options.tags = tags; }
    if(!_.isUndefined(category))    { options.category = category; }
    if(!_.isUndefined(attachments)) { options.attachments = attachments; }


    return options;
  }


  _setSlug(model, options, callback) {
    if(_.isUndefined(options.slug) || model.slug === options.slug) {
      callback(null, model, options);
    } else {
      slugger(Article, model.title, options.slug, function(err, articleSlug) {
        /* istanbul ignore next */
        if (err) { return callback(err); }

        model.slug = articleSlug;
        callback(null, model, options);
      });
    }
  }


  _setCategory(model, options, callback) {
    if(_.isUndefined(options.category)) {
      callback(null, model, options);
    } else {

      let category = options.category;

      if(!_.isObject(category)) {
        try {
          category = JSON.parse(category);
        } catch(e) {
          return callback( errors.Validation(model, 'category', 'Tags must be a valid JSON') );
        }
      }

      CategoryUtil.setCategory(model, category, function(err) {

        /* istanbul ignore next */
        if (err) {
          if(err.code === 11000) {
            var repeatedCategory = /:\ "(.+)" \}$/.exec(err.message)[1];
            err = errors.Validation(model, 'category', "Can't create category '" + repeatedCategory + "', already exists");
          }

          return callback(err);
        }
        callback(null, model, options);
      });
    }
  }


  _setTags(model, options, callback) {
    if(_.isUndefined(options.tags)) {
      callback(null, model, options);
    } else {

      let tags = options.tags;

      if(!_.isObject(tags)) {
        try {
          tags = JSON.parse(tags);
        } catch(e) {
          return callback( errors.Validation(model, 'tags', 'Tags must be a valid JSON') );
        }
      }

      TagsUtil.setTags(model, tags, function(err) {
        /* istanbul ignore next */
        if (err) {
          if(err.code === 11000) {
            var repeatedTag = /:\ "(.+)" \}$/.exec(err.message)[1];
            err = errors.Validation(model, 'tags', "Can't create tag '" + repeatedTag + "', already exists");
          }

          return callback(err);
        }
        callback(null, model, options);
      });
    }
  }


  /**
   * Set the article attachments
   *
   * (the attachments are wrappers for the Upload model, with some additional metadata)
   *
   * The removed files are not deleted here (from the disk, S3 or whateer)
   * because the file might be referenced elsewhere.
   *
   * TODO: create a cron to check for unreferenced fles and delete them
   */
  _setAttachments(model, options, callback) {
    if(_.isUndefined(options.attachments)) {
      callback(null, model, options);
    } else {

      let attachments = options.attachments;

      if(!_.isObject(attachments)) {
        try {
          attachments = JSON.parse(attachments);
        } catch(e) {
          return callback( errors.Validation(model, 'attachments', 'Attachments must be a valid JSON') );
        }
      }

      let parsed = [];

      if(_.isArray(attachments)) {
        parsed = attachments.map(function(attachment) {
          let parsedAttachment = _.pick(attachment, 'name', 'description');

          if(attachment.upload && attachment.upload.id) {
            parsedAttachment.upload = objectid(attachment.upload.id);
          } else if(attachment.uploadId) {
            // simplified version
            parsedAttachment.upload = objectid(attachment.uploadId);
          }

          return parsedAttachment;
        });
      }

      // update the article attachments
      model.set('attachments', parsed);

      callback(null, model, options);
    }
  }

}


module.exports = ArticlesController;

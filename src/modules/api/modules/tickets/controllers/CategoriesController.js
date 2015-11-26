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
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Category        = require(moduleBasePath + '/models/Category');


/**
 * Categories Controller
 */
class CategoriesController extends BaseController
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
      "managers": {}
    });
  }


  /**
   * Create a new Category
   */
  create(req, res, next) {
    var
      Model    = this.Model,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body.managers),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new Model(newAttrs);
        callback(null, model, waterfallOptions);
      },
      this._setManagers,
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
   * Update a Category
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
      waterfallOptions = this._buildWaterfallOptions(req.body.managers),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch);

    async.waterfall([
      function setup(callback) {
        Model.findOne(criteria).exec(function(err, categoryModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!categoryModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          categoryModel.set(newAttrs);

          // if doing a full update, make sure the values are reset if there's no data
          if(!patch) {
            /* istanbul ignore next */
            if(!req.body.managers) {
              categoryModel.managers = [];
            }
          }

          callback(null, categoryModel, waterfallOptions);
        });
      },
      this._setManagers,
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



  // Aux. "private" methods
  // (actually they're not private so can be easily tested)
  // =============================================================================

  _buildWaterfallOptions(managers) {
    var options = {};
    if(!_.isUndefined(managers)) { options.managers = managers; }
    return options;
  }


  _setManagers(model, options, callback) {
    callback(null, model, options);

    // if(_.isUndefined(options.managers)) {
    //   callback(null, model, options);
    // } else {

    // }
  }

}


module.exports = CategoriesController;

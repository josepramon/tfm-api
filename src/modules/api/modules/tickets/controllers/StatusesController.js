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
  Status          = require(moduleBasePath + '/models/Status');


/**
 * Statuses Controller
 */
class StatusesController extends BaseController
{
  constructor() {
    super();

    /**
     * @type {Model}
     */
    this.Model = Status;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({});
  }


  /**
   * Create a new Status
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
   * Update a Status
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
        Model.findOne(criteria).exec(function(err, statusModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!statusModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          statusModel.set(newAttrs);

          callback(null, statusModel, {});
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


module.exports = StatusesController;

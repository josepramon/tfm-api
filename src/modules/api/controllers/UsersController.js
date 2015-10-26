'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),

  // API utilities
  Request         = require('../util/Request'),
  Response        = require('../util/Response'),
  ExpandsURLMap   = require('../util/ExpandsURLMap'),

  // Base class
  BaseController  = require('../controllers/BaseController'),

  // Model managed by this controller
  User            = require('../models/User');


/**
 * UsersController
 */
class UsersController extends BaseController
{
  constructor() {
    super();
    /**
     * @type {Model}
     */
    this.Model = User;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap();
  }


  /**
   * Create a new User
   */
  create(req, res, next) {
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = {},

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new User(newAttrs);

        if(request.req.body.role) {
          model.role = request.req.body.role;
        }

        callback(null, model, waterfallOptions);
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
   * Update a User
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = {},

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch);

    async.waterfall([
      function setup(callback) {
        User.findOne(criteria).exec(function(err, userModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!userModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          userModel.set(newAttrs);

          callback(null, userModel, waterfallOptions);
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


module.exports = UsersController;

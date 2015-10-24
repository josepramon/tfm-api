'use strict';

var
  _             = require('underscore'),
  async         = require('async'),
  errors        = require('src/lib/errors'),
  Request       = require('../util/Request'),
  Response      = require('../util/Response'),
  ExpandsURLMap = require('../util/ExpandsURLMap');


/**
 * BaseController
 */
class BaseController
{
  constructor() {

    /**
     * @type {Model}
     */
    this.Model = null;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap();
  }

  /**
   * Retrieve one Model element
   */
  getOne(req, res, next) {

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      criteria = this._buildCriteria(request);

    this.Model
      .findOne(criteria)
      .exec(function(err, model) {
        /* istanbul ignore next */
        if (err)    { return next(err); }
        if (!model) { return next(new errors.NotFound()); }

        response.formatOutput(model, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
  }


  /**
   * Retrieve all the model instances, paginated
   */
  getAll(req, res, next) {

    var
      request    = new Request(req),
      response   = new Response(request, this.expandsURLMap),
      criteria   = this._buildCriteria(request);


    this.Model.paginate(criteria, request.options, function(err, paginatedResults, pageCount, itemCount) {
      /* istanbul ignore next */
      if (err) { return next(err); }

      response
        .setPaginationParams(pageCount, itemCount)
        .formatOutput(paginatedResults, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });

    });
  }


  /**
   * Create one Model instance and save it
   * @abstract
   */
  /* istanbul ignore next */
  create(req, res, next) { next(); }


  /**
   * Edit one Model instance
   * @abstract
   */
  /* istanbul ignore next */
  update(req, res, next) { next(); }


  /**
   * Edit one Model instance
   * @abstract
   */
  updatePartial(req, res, next) {
    this.update(req, res, next, true);
  }


  /**
   * Delete one Model instance
   */
  delete(req, res, next) {

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      criteria = this._buildCriteria(request);

    this.Model
      .findOne(criteria)
      .exec(function(err, model) {
        /* istanbul ignore next */
        if (err)    { return next(err); }
        if (!model) { return next( new errors.NotFound() ); }

        model.remove(function() {
          response.formatOutput(model, function(err, output) {
            /* istanbul ignore next */
            if (err) { return next(err); }

            res.json(output);
          });
        });
    });
  }


  // Aux. "private" methods
  // (actually they're not private so can be easily tested)
  // =============================================================================

  _buildCriteria(request) {
    var criteria = {};

    if(request.req.params.id) {
      criteria._id = request.req.params.id;
    }

    return criteria;
  }


  _getAssignableAttributes(request, patch) {
    var
      defaults  = {},
      safeAttrs = this.Model.safeAttrs;

    if(!patch) {
      defaults = safeAttrs.reduce(function(memo, key) {
        memo[key] = undefined;
        return memo;
      }, {});
    }

    return _.extend(
      defaults,
      _.pick(request.req.body, safeAttrs)
    );
  }


  _validate(model, options, callback) {
    model.validate(function (err) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model, options);
    });
  }


  _save(model, options, callback) {
    model.save(function(err) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model, options);
    });
  }

}


module.exports = BaseController;

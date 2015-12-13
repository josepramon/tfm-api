'use strict';

var
  _             = require('underscore'),
  async         = require('async'),
  errors        = require('src/lib/errors'),
  Request       = require('../util/Request'),
  Response      = require('../util/Response'),
  ExpandsURLMap = require('../util/ExpandsURLMap'),
  filters       = require('../util/filters');


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

        // Some models have attached a soft delete plugin that adds an additional
        // 'delete' method that performs the soft delete.
        // So, if the model has the plugin use that, or fall back to the regular
        // 'remove' method provided by Mongoose
        var removeMethod = model.delete ? 'delete' : 'remove';

        model[removeMethod](function() {
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

  /**
   * Query builder for mongoose
   */
  _buildCriteria(request) {
    var criteria = {};

    if(request.req.params.id) {
      criteria._id = request.req.params.id;
    }

    if(request.filters) {
      _.extend(criteria, this._parseFilters(request));
    }

    return criteria;
  }


  /**
   * Filters parsing for the querys
   *
   * Filtering for the db queries. The filters might come from the request, defined
   * in the querystring with something like
   * `?filter=filterName:params,anotherFilterName:params`
   * or may be injected from some middleware.
   *
   * By default, the only querystring filters accepted are the ones related to
   * the model safe attributes, and the special 'search' filter,
   * that allows filtering by the presence of some string in multiple attributes
   * (using a 'text' index deffined in the collection).
   *
   * This method should be extended/overrided
   * in any controller that extends this class to implement custom filters.
   */
  _parseFilters(request) {
    var
      // retrieve the filters from the querystring for the 'safe' attributes
      safeAttrsFilters = filters.getSafeAttributesFilters(request.filters, this.Model),

      // retrieve the search
      searchFilters = filters.getSearchFilters(request.filters, request),

      // other filters
      additionalFilters = {};

    // limit by owner (this might come from some middleware)
    if(_.has(request.filters, 'owner')) {
      additionalFilters = {'owner': request.filters.owner};
    }

    return _.extend({}, safeAttrsFilters, searchFilters, additionalFilters);
  }


  /**
   * Determines the attributes that can be mass assigned to the model
   */
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


  /**
   * Model validation
   */
  _validate(model, options, callback) {
    model.validate(function (err) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model, options);
    });
  }


  /**
   * Model save
   */
  _save(model, options, callback) {
    model.save(function(err) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model, options);
    });
  }

}


module.exports = BaseController;

'use strict';

var
  _             = require('underscore'),
  expandsParser = require('./expandsParser'),
  sortParser    = require('./requestSortParser'),
  config        = require('../../../config'),
  getFilters    = require('./filterParser');


/**
 * Request utility
 *
 * Wraps the 'req' object returned by Express
 * and adds some useful methods.
 */
class Request {

  /**
   * @param {Object} the request object, returned by Express
   */
  constructor(request) {
    this.req        = request;
    this.customOpts = {};
  }

  /**
   * Getter for the data 'owner' (the client)
   *
   * Soem documents have a 'owner' attribute to filter out the data
   * from other users. Currently, this method just returns the user id
   * from the token.
   *
   * @return {ObjectId} the 'owner' id
   */
  getOwnerFromAuth() {
    return this.req.user.userId;
  }


  parseExpands(expands) {
    if(!Array.isArray(expands)) {
      expands = [expands];
    }
    expands = _.reduce(_.compact(expands), function(memo, expand) {
      /* istanbul ignore next */
      var expandParts = expand && _.isString(expand) ? expand.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\(]*\))/) : [];
      return memo.concat(expandParts);
    }, []);
    expands = _.unique(expands);

    return expands;
  }


  /**
   * @param {Number} maxDepth maximum nested expansion level (by default 1)
   * @return {Object}         the attributes to expand
   */
  getExpands(maxDepth) {
    maxDepth = maxDepth || 1;

    var
      expands       = this.parseExpands(this.req.query.include),
      filteredSpans = {};

    if(expands.length) {
      // filter out the expands to a maximum depth
      filteredSpans = expands.filter(function(expand) {
        let expandPath = expand.split(':')[0];
        return expandPath.split('.').length <= maxDepth;
      });

      if(filteredSpans.length) {
        filteredSpans = expandsParser.parse(filteredSpans);
      }
    }

    return filteredSpans;
  }


  /**
   * Mongoose queries options builder from the querystring params (used on the paginated queries)
   *
   * @return {Object} Options for the mongoose queries.
   */
  get options() {
    var
      limit = this.req.query.per_page || this.req.query.limit || config.pagination.defaultLimit,
      sort  = this._getSort(),
      opts  = {
        page:  parseInt(this.req.query.page || 1, 10),
        limit: parseInt(limit, 10)
      };

    if(opts.limit > config.pagination.maxLimit) {
      opts.limit = config.pagination.maxLimit;
    }

    if(sort) {
      opts.sortBy = sort;
    }

    return _.extend(opts, this.customOpts);
  }


  /**
   * Adds a custom option used on the mongoose queries
   */
  addOption(k,v) {
    this.customOpts[k] = v;
  }


  /**
   * @return {String} The full request URL, without any querystring params
   */
  get requestURL() {
    return this.req.protocol + '://' + this.req.headers.host + this.req.baseUrl + this.req.path;
  }


  /**
   * @return {String} The base URL where the controller is mounted
   *                  (for example: http://localhost/api)
   */
  get requestBaseURL() {
    return this.req.protocol + '://' + this.req.headers.host + this.req.baseUrl;
  }


  /**
   * Sort options builder
   * @return {Object} Sorting options for the mongoose queries
   */
  _getSort() {
    var sortOpts = null;

    if(this.req.query.sort) {
      let sortParams = this.req.query.sort;

      if(_.isArray(sortParams)) {
        sortParams = sortParams.join(',');
      }

      sortOpts = sortParser.parse(sortParams);
    }

    return sortOpts;
  }


  get filters() {
    return getFilters(this.req);
  }

}


module.exports = Request;

'use strict';

var
  _          = require('lodash'),
  async      = require('async'),
  getFilters = require('../util/filterParser'),
  stringUtil = require('../util/string');


/**
 * Inject additional filters (that will be used when composing mongo queries)
 *
 * @param {Object}  filters  Filters
 * @param {Boolean} override If true, the new filters will override
 *                           any preexisting key with the same name
 */
var addFilters = function(filters, override, req, res, next) {
  req.filters = req.filters || getFilters(req);

  // the filters values might be functions (to retrieve stuff from the DB,
  // or for whatever reason). So execute them if any.
  async.forEachOf(filters, function (value, key, cb) {

    if(!_.isFunction(value)) {
      cb();
    } else {
      value(function(data) {
        filters[key] = data;
        cb();
      });
    }

  }, function(err) {
    /* istanbul ignore next */
    if (err) { return next(err); }

    if(override) {
      req.filters = _.extend(req.filters, filters);
    } else {
      req.filters = _.defaults(req.filters, filters);
    }

    var stringifiedFilters, currentFilters;

    stringifiedFilters = _.pairs(req.filters).map(function(pair) {
      if(_.isObject(pair[1]) || _.isNull(pair[1])) {
        // convert to string or the value will be lost
        pair[1] = stringUtil.escapeQueryParam(JSON.stringify(pair[1]));
      }

      return pair.join(':');
    }).join(',');

    req.query.filter = stringifiedFilters;

    next();
  });
};


module.exports = {
  middleware: addFilters
};

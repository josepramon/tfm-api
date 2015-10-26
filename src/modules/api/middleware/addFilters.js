'use strict';

var
  _     = require('lodash'),
  async = require('async');


/**
 * Inject additional filters (that will be used when composing mongo queries)
 *
 * @param {Object}  filters  Filters
 * @param {Boolean} override If true, the new filters will override
 *                           any preexisting key with the sam name
 */
var addFilters = function(filters, override, req, res, next) {
  req.filters = req.filters || {};


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
      _.extend(req.filters, filters);
    } else {
      _.defaults(req.filters, filters);
    }

    next();
  });
};


module.exports = {
  middleware: addFilters,
};

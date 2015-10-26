'use strict';

var _ = require('lodash');

/**
 * Inject additional filters (that will be used when composing mongo queries)
 *
 * @param {Object}  filters  Filters
 * @param {Boolean} override If true, the new filters will override
 *                           any preexisting key with the sam name
 */
var addFilters = function(filters, override, req, res, next) {
  req.filters = req.filters || {};

  if(override) {
    _.extend(req.filters, filters);
  } else {
    _.defaults(req.filters, filters);
  }

  next();
};


module.exports = {
  middleware: addFilters,
};

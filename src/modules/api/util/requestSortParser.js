'use strict';

var _ = require('underscore');


/**
 * Sorting options parsing
 * @param {String} sortParams  The requested sorting params (from the querystring)
 *                             There can be multiple params, separated with commas
 * @return {Object}            Something like { sortkey1: direction, sortkey1: direction }
 */
var parseSortingOptions = function(sortParams) {
  if(!sortParams) { return {}; }

  return _.reduce(sortParams.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\(]*\))/), function(memo, param) {
    let paramParts = param.split('|');
    memo[paramParts[0]] = _normalizeSortOrder(paramParts[1]);
    return memo;
  }, {});
};


/**
 * Normalizes the supplied value or returns the default
 * @param  {String} the supplied value
 * @return {String} Sort order
 */
var _normalizeSortOrder = function(val) {
  var
    order       = 'asc', // default
    sortOptions = {
      'asc'  : 'asc',
      'desc' : 'desc',
      '1'    : 'asc',
      '-1'   : 'desc'
    };

  if(val) {
    order = sortOptions[val.toLowerCase()] || order;
  }

  return order;
};


module.exports = {
  parse: parseSortingOptions,
  _normalizeSortOrder: _normalizeSortOrder
};

'use strict';

var
  _          = require('lodash'),
  stringUtil = require('./string');


var parseFilters = function(req) {
  req = req || {};
  req.query = req.query || {};

  var filters = {};
  if(req.query.filter) {
    req.query.filter.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\(]*\))/).forEach(function(filter) {
      let filterParts = filter.split(':');
      let val = stringUtil.unescapeQueryParam(filterParts[1]);

      try {
        val = JSON.parse(val);
      } catch(e) {}

      filters[filterParts[0]] = val;
    });
  }
  return filters;
};


module.exports = parseFilters;

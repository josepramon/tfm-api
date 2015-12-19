'use strict';

var
  _              = require('lodash'),
  config         = require('src/config'),
  errors         = require('src/lib/errors'),
  apiBasePath    = '../../..',
  moduleBasePath = '..',
  addFilters     = require(apiBasePath +'/middleware/addFilters').middleware;


/**
 * Access filter for tickets nested docs (like comments)
 */
var accessFilter = function(req, res, next) {
  var filters = {};

  if(req.user.role === config.roles.user) {

    // Regular users can't delete comments
    if(req.method === 'DELETE') {
      return next(new errors.Unauthorized());
    }

    // Prevent regular users from adding/editing comments on closed tickets
    return addFilters({closed:false}, true, req, res, next);
  }

  next();
};


module.exports = accessFilter;

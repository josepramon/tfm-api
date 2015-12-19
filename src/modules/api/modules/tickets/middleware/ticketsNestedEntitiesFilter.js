'use strict';

var
  _                        = require('lodash'),
  config                   = require('src/config'),
  apiBasePath              = '../../..',
  moduleBasePath           = '..',
  addFilters               = require(apiBasePath +'/middleware/addFilters').middleware;


/**
 * Access filter for tickets nested docs (like comments)
 */
var accessFilter = function(req, res, next) {
  var filters = {};

  // admins can do whatever they want
  if(req.user.role === config.roles.admin) {
    return next();
  }

  // users can only modify their own tickets
  if(req.user.role === config.roles.user) {
    filters = {user: req.user.id};
  }

  // managers can only modify their assigned tickets
  if(req.user.role === config.roles.manager) {
    filters = {manager: req.user.id};
  }

  return addFilters(filters, true, req, res, next);
};


module.exports = accessFilter;

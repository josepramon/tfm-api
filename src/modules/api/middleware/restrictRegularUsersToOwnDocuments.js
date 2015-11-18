'use strict';

var
  config     = require('src/config'),
  errors     = require('src/lib/errors'),
  addFilters = require('./addFilters').middleware;


/**
 * Middleware to restrict regular users to their own documents
 * (the document must have an `owner` key)
 */
var restrictRegularUsersToOwnDocuments = function(req, res, next) {
  if(!req.user) {
    return next(new errors.Unauthorized());
  }

  if(req.user.role === config.roles.user) {
    return addFilters({owner: req.user.id}, true, req, res, next);
  }

  next();
};


module.exports = {
  middleware: restrictRegularUsersToOwnDocuments
};

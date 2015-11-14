'use strict';

var
  _      = require('lodash'),
  errors = require('src/lib/errors'),
  config = require('src/config');

const ADMIN_USER_ROLE = config.roles.admin;

/**
 * Simple middleware to prevent some authenticated user
 * from accessing/editing the user entity from another user
 */
var userRestrictToItself = function(req, res, next) {
  if(!req.user) {
    return next(new errors.Unauthorized());
  }

  var
    authenticatedUser   = req.user,
    authenticatedUserId = authenticatedUser.id,
    requestedUserId     = req.params.id;


  if(authenticatedUser.role === ADMIN_USER_ROLE) {
    // admins have unlimited access
    next();
  } else if(authenticatedUserId === requestedUserId) {
    // the authenticated user is trying to edit its own user entity
    next();
  } else {
    return next(new errors.Unauthorized());
  }
};


module.exports = {
  middleware: userRestrictToItself
};

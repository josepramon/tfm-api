'use strict';

var
  _             = require('lodash'),
  errors        = require('src/lib/errors'),
  config        = require('src/config'),
  User          = require('../models/User'),
  debug         = require('debug')('ApiApp:RestrictByAppMiddleware:' + process.pid);


// Restrict the access based on some application identifier
//
// Currently only used to prevent regular users from loggin to the admins app
// (and viceversa), based on the user role, but this could be more generic
// (for example in a multitenant API)
// =============================================================================
var validateAccessByApp = function (req, res, next) {

  var
    username      = req.body.username,
    applicationID = req.body.appID,
    errMessage = 'Invalid username or password';

  if (_.isEmpty(applicationID)) {
    // no app id, continue (maybe the user is calling directly the API?)
    // (additional middlewares my restrict the access)
    return next();
  }


  process.nextTick(function () {
    User.findOne({username: username}).populate('role').exec(function(err, user) {
      if (err || !user) { return next( new errors.Unauthorized(errMessage) ); }

      var
        application = config.applications[applicationID],
        role = user.role || {};

      if(!application) {
        // unrecognised app, continue
        return next();
      } else if(application.allowedRoles.indexOf(role.name) > -1) {
        // access allowed
        return next();
      } else {
        return next( new errors.Unauthorized(errMessage) );
      }
    });
  });
};


module.exports = validateAccessByApp;

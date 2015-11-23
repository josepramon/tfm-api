'use strict';

var
  _             = require('lodash'),
  errors        = require('src/lib/errors'),
  jwtAuth       = require('src/lib/jwtAuth'),
  User          = require('../models/User'),
  debug         = require('debug')('ApiApp:AuthenticateMiddleware:' + process.pid);


// AUTHENTICATION MIDDLEWARE
// =============================================================================
var authenticate = function (req, res, next) {

  var
    username = req.body.username,
    password = req.body.password,
    errMessage = 'Invalid username or password';

  if (_.isEmpty(username) || _.isEmpty(password)) {
    return next( new errors.Unauthorized(errMessage) );
  }


  process.nextTick(function () {
    User.findOne({username: username}).deepPopulate('role profile.image').exec(function(err, user) {
      if (err || !user) { return next( new errors.Unauthorized(errMessage) ); }

      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          debug('User authenticated, generating token');
          jwtAuth.create(user, req, res, next);
        } else {
          return next( new errors.Unauthorized(errMessage) );
        }
      });
    });
  });
};


module.exports = authenticate;

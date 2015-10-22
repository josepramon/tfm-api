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
    password = req.body.password;


  if (_.isEmpty(username) || _.isEmpty(password)) {
    return next( new errors.Unauthorized('Invalid username or password') );
  }


  process.nextTick(function () {
    User.findOne({username: username}).populate('profile').exec(function(err, user) {
      if (err || !user) {
        return next( new errors.Unauthorized('Invalid username or password') );
      }

      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          debug('User authenticated, generating token');
          jwtAuth.create(user, req, res, next);
        } else {
          return next( new errors.Unauthorized('Invalid username or password') );
        }
      });
    });
  });
};


module.exports = authenticate;

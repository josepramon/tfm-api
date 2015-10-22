'use strict';

var
  // generic stuff
  _             = require('lodash'),
  debug         = require('debug')('ApiApp:AuthController:' + process.pid),
  errors        = require('src/lib/errors'),
  jwtAuth       = require('src/lib/jwtAuth'),

  // API utilities
  Request       = require('../util/Request'),
  Response      = require('../util/Response'),

  // Model managed by this controller
  User          = require('../models/User');



var AuthController = {

  login: function(req, res, next) {
    // auth handling implemented in the Authenticated middleware
    (new Response()).formatOutput(req.user, function(err, output) {
      /* istanbul ignore next */
      if (err) { return next(err); }
      res.json(output);
    });
  },


  logout: function(req, res, next) {

    jwtAuth.retrieve(req.params.token, function(err, data) {
      /* istanbul ignore next */
      if (err) {
        return next( new errors.Unauthorized('User not found') );
      }

      /* istanbul ignore else */
      if (jwtAuth.expire(req.headers)) {
        delete req.user;
        var msg = { 'message': 'User has been successfully logged out' };

        (new Response()).formatOutput(msg, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }
          res.json(output);
        });

      } else {
        return next(new errors.Unauthorized());
      }
    });
  },


  tokenRenew: function(req, res, next) {

    /* istanbul ignore next */
    if(req.params.token !== req.user.token) {
      return next(new errors.Unauthorized());
    }

    User.findOne({username: req.user.username}).populate('role').exec(function(err, user) {

      /* istanbul ignore next */
      if (err || !user) {
        return next( new errors.Unauthorized('User not found') );
      }

      jwtAuth.create(user, req, res, function() {
        jwtAuth.expire(req.headers);

        (new Response()).formatOutput(req.user, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }
          res.json(output);
        });
      });

    });

  },


  tokenVerify: function(req, res, next) {
    /* istanbul ignore next */
    if(req.params.token !== req.user.token) {
      return next(new errors.Unauthorized());
    }

    var msg = { 'message': 'Token is valid' };

    (new Response()).formatOutput(msg, function(err, output) {
      /* istanbul ignore next */
      if (err) { return next(err); }
      res.json(output);
    });
  }

};


module.exports = AuthController;

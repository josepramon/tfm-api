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
  User          = require('../models/UserBase');



class AuthController
{
  login(req, res, next) {
    // auth handling implemented in the Authenticated middleware

    (new Response()).formatOutput(this._formatUResponse(req), function(err, output) {
      /* istanbul ignore next */
      if (err) { return next(err); }
      res.json(output);
    });
  }


  logout(req, res, next) {

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
  }


  tokenRenew(req, res, next) {

    /* istanbul ignore next */
    if(req.params.token !== req.user.token) {
      return next(new errors.Unauthorized());
    }

    User.findOne({_id: req.user.id}).populate('role').exec(function(err, user) {

      /* istanbul ignore next */
      if (err || !user) {
        return next( new errors.Unauthorized('User not found') );
      }

      jwtAuth.create(user, req, res, function() {
        jwtAuth.expire(req.headers);

        var response = {
          token:     req.user.token,
          token_exp: req.user.token_exp,
          token_iat: req.user.token_iat
        };

        (new Response()).formatOutput(response, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }
          res.json(output);
        });
      });

    });
  }


  tokenVerify(req, res, next) {
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


  _formatUResponse(req) {
    var
      request  = new Request(req),
      userData = req.user,
      userObj  = userData.userObj,
      userURL  = this._getUserURL(request.requestBaseURL, userData.userObj);

    userObj.profile = this._formatProfile(userObj);

    return {
      token:     userData.token,
      token_exp: userData.token_exp,
      token_iat: userData.token_iat,
      user: {
        meta: {
          url: userURL
        },
        data: userObj
      }
    };
  }

  _getUserURL(apiBase, user) {
    if(user.id && user.role) {
      return apiBase + '/auth/' + user.role.toLowerCase() + 's/' + user.id;
    } else {
      return null;
    }
  }

  // format the profile as a relation
  _formatProfile(user) {
    var profile = user.profile || {};
    return {
      meta: { url: null },
      data: profile
    };
  }

}


module.exports = AuthController;

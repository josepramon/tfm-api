'use strict';

var
  _               = require('underscore'),
  uuid            = require('node-uuid'),
  config          = require('src/config'),
  errors          = require('src/lib/errors'),
  mailer          = require('src/lib/mailer'),
  Request         = require('../util/Request'),
  Response        = require('../util/Response'),
  ExpandsURLMap   = require('../util/ExpandsURLMap'),
  cache           = require('../util/Cache'),
  User            = require('../models/UserBase');


/**
 * PasswordRecoveryController
 */
class PasswordRecoveryController
{
  constructor(userType) {
    // prefix for the keys used to persist the requests on redis
    this.keyPrefix = 'passwordChange_';

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({});
  }


  create(req, res, next) {
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      params   = req.body,
      query    = {},
      self     = this;

    if(params.username) {
      query = { username: String(params.username) };
    } else if(params.email) {
      query = { email: String(params.email) };
    } else {
      return next(new errors.BadRequest());
    }

    User.findOne(query).populate('role').exec(function(err, model) {
      /* istanbul ignore next */
      if (err)    { return next(err); }
      if (!model) { return next(new errors.NotFound('User not found')); }

      self._createPasswordChangeRequest(model, function(err, passwordChangeRequest) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        var success = {
          success: true,
          message: 'Password reset request created successfully',
          user:    model.id
        };

        response.formatOutput(success, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }
          res.json(output);
        });
      });
    });
  }


  update(req, res, next) {
    var
      request    = new Request(req),
      response   = new Response(request, this.expandsURLMap),
      recoveryId = this.keyPrefix + req.params.id;


    cache.get(recoveryId, function(err, userId) {
      /* istanbul ignore next */
      if (err)     { return next(err); }
      if (!userId) { return next(new errors.NotFound()); }

      var
        criteria = {_id: userId},
        newAttrs = { password: req.body.password };


      User.findOne(criteria).exec(function(err, userModel) {
        /* istanbul ignore next */
        if (err)           { return next(err); }
        /* istanbul ignore next */
        if (!userModel) { return next(new errors.NotFound()); }

        // set the new password
        userModel.set(newAttrs);

        // save the model
        userModel.save(function(err) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          // expire the request
          cache.expire(recoveryId, 0);

          var success = {
            success: true,
            message: 'Password changed successfully',
            user:    userId
          };

          response.formatOutput(success, function(err, output) {
            /* istanbul ignore next */
            if (err) { return next(err); }
            res.json(output);
          });
        });
      });
    });
  }


  // Aux. "private" methods
  // =============================================================================

  /**
   * Creates a password change request
   * A request is a temporary record (on redis)
   */
  _createPasswordChangeRequest(userModel, callback) {
    var
      // create an unique id for the request
      // (it will be used as the url param. and as the redis key)
      uniqueId = uuid.v4(),

      // add a prefix to the key (to make it easier to identify the keys in redis)
      key = this.keyPrefix + uniqueId,

      // key value
      payload = userModel.id,

      // request validity (2 hours)
      expires = 2*60*60,

      self = this;

    cache.set(key, payload, function(err) {
      if(err) { return callback(err); }

      // make the key auto expire
      cache.expire(key, expires);

      // send the mail
      self._sendPasswordChangeMail(userModel, uniqueId, function(err) {
        if(err) { return callback(err); }
        callback(null, { _id: uniqueId });
      });
    });
  }


  /**
   * Send a mail to the user with the link to reset the password
   */
  _sendPasswordChangeMail(userModel, changeId, callback) {
    var baseUrl, url;

    // compose the url
    baseUrl = config.sites.users;

    if(userModel.role && userModel.role.name && (userModel.role.name !== config.roles.user)) {
      // the user is an admin or a manager, change the base url
      baseUrl = config.sites.admin;
    }

    url = baseUrl + '/#user/recover-password/' + changeId;

    var mailData = {
      to:       userModel.email,
      subject:  'Password change request',
      template: 'mail_resetPassword',
      context: {
        resetUrl: url
      }
    };

    mailer.send(mailData, function(err, info) {
      if(err) { return callback(err); }
      callback(null);
    });
  }

}



module.exports = PasswordRecoveryController;

'use strict';

var
  _               = require('underscore'),
  async           = require('async'),
  uuid            = require('node-uuid'),
  faker           = require('faker'),
  config          = require('src/config'),
  errors          = require('src/lib/errors'),
  mailer          = require('src/lib/mailer'),
  crypt           = require('src/lib/crypt'),
  Request         = require('../util/Request'),
  Response        = require('../util/Response'),
  ExpandsURLMap   = require('../util/ExpandsURLMap'),
  cache           = require('../util/Cache'),
  RoleUtil        = require('../util/RoleUtil'),
  User            = require('../models/User');



/**
 * User Activation controller
 *
 * When creating a new user, the user is not created directly on Mongo.
 * Instead, the user is saved temporally on Redis, until the account
 * is verified and activated.
 */
class UsersActivationController
{
  constructor(savePasswordOnCreate) {

    /**
     * Prefix for the keys used to persist the requests on redis
     * @type {String}
     */
    this.keyPrefix = 'accountActivation_';

    /**
     * Save the user password when creating it
     *
     * On some circumstances (for example when creating managers), the password
     * shpild not be saved at that point, and instead, the user should set it
     * when activating the account.
     *
     * @type {Boolean}
     */
    this.savePasswordOnCreate = savePasswordOnCreate;

    /**
     * Expiration time (the user must activate the account in this timeframe)
     * @type {Number}
     */
    this.requestValidity = 12*60*60; // (12 hours)

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap();
  }


  /**
   * Create a new User
   */
  create(req, res, next) {
    var
      self     = this,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request),

      // certain users can't register themselves ('managers' are created by
      // the admins), so in that situation, no password will be provided (the
      // users will provide one when activating the account). In order to
      // validate the model, a password is required.
      password = this.savePasswordOnCreate ? request.req.body.password : faker.internet.password();


    async.waterfall([
      function setup(callback) {

        // create and populate the user model
        var model = new User(newAttrs);

        if(request.req.body.role) {
          model.role = request.req.body.role;
        }

        model.password = password;

        callback(null, model);
      },
      this._validate,
      this._checkUnique,
      this._save.bind(self),
      this._sendActivationMail

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }


  /**
   * Activate an user
   */
  activate(req, res, next) {
    var
      request    = new Request(req),
      response   = new Response(request, this.expandsURLMap),
      recoveryId = this.keyPrefix + req.params.id,
      self       = this;

    async.waterfall([

      function retrieve(callback) {
        cache.get(recoveryId, function(err, data) {
          /* istanbul ignore next */
          if (err)   { return next(err); }
          if (!data) { return next(new errors.NotFound()); }

          // expire the request
          cache.expire(recoveryId, 0);

          callback(null, data);
        });
      },

      function decrypt(data, callback) {
        var userData, decrypted;

        try {
          decrypted = crypt.decrypt(data);
          userData = JSON.parse(decrypted);
        } catch(e) {
          return callback(e);
        }

        callback(null, userData);
      },

      function createModel(data, callback) {

        var
          model = new User(data),

          // update attributes with any new data
          newAttrs = self._getAssignableAttributes(request, true);

        if(!_.isUndefined(req.body.password)) {
          newAttrs.password = req.body.password;
        }

        model.set(newAttrs);
        callback(null, model);
      },

      this._validate,

      function saveModel(model, callback) {
        model.save(function(err) {
          /* istanbul ignore next */
          if (err) { return callback(err); }
          callback(null, model);
        });
      }

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }
        res.json(output);
      });
    });

  }


  // Aux. "private" methods
  // =============================================================================

  /**
   * Model mass assignable attributes getter
   */
  _getAssignableAttributes(request, patch) {
    var
      defaults  = {},
      safeAttrs = User.safeAttrs;

    if(!patch) {
      defaults = safeAttrs.reduce(function(memo, key) {
        memo[key] = undefined;
        return memo;
      }, {});
    }

    return _.extend(
      defaults,
      _.pick(request.req.body, safeAttrs)
    );
  }


  /**
   * Model validation
   */
  _validate(model, callback) {
    model.validate(function (err) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model);
    });
  }


  /**
   * Model 'unique' constrains validation
   *
   * The '_validate' method does not check for attributes uniqueness
   * (because that is performed on the database level)
   */
  _checkUnique(model, callback) {

    var criteria = { $or: [
      { username: model.username },
      { email: model.email }
    ]};


    User.findOne(criteria).exec(function(err, userModel) {
      /* istanbul ignore next */
      if (err) { return callback(err); }

      if (userModel) {
        var attribute = model.username === userModel.username ? 'username' : 'email';
        return callback(new errors.UniqueKey(model, attribute));
      }

      callback(null, model);
    });
  }


  /**
   * Creates a temporary record for the user registration (on redis)
   */
  _save(userModel, callback) {
    var
      // create an unique id for the request
      // (it will be used as the url param. and as the redis key)
      uniqueId = uuid.v4(),

      // add a prefix to the key (to make it easier to identify the keys in redis)
      key = this.keyPrefix + uniqueId,

      // key value
      payload = {
        username: userModel.username,
        password: userModel.password,
        email:    userModel.email,
        role:     userModel.role
      },

      // request validity (make the record autoexpire)
      expires = this.requestValidity;

    // since the data contains the password in plain text (it gets encrypted
    // when saving) encrypt it before saving to redis (better yet, encrypt
    // the whole payload)
    payload = crypt.crypt(JSON.stringify(payload));

    cache.set(key, payload, function(err) {
      if(err) { return callback(err); }

      // make the key auto expire
      cache.expire(key, expires);

      callback(null, userModel, uniqueId);
    });
  }


  /**
   * Send a mail to the user with the link to activate the account
   */
  _sendActivationMail(userModel, activationId, callback) {

    // compose the url
    var
      baseUrl = config.sites.users,
      url;

    // retrieve (from redis if available) the regular user role
    // to determine the activation url
    RoleUtil.getRoleByName(config.roles.user, function(err, roleModel) {
      // if the roles are ObjectIds, convert them to strings for the comparison
      var
        roleId     = roleModel.id.toHexString   ? roleModel.id.toHexString()   : roleModel.id,
        userRoleId = userModel.role.toHexString ? userModel.role.toHexString() : userModel.role;

      if(userRoleId !== roleId) {
        // the user is an admin or a manager, change the base url
        baseUrl = config.sites.admin;
      }

      url = baseUrl + '/#user/activate/' + activationId;

      // set the mail parameters
      var mailData = {
        to:       userModel.email,
        subject:  'Account activation',
        template: 'mail_activateAccount',
        context: {
          activationUrl: url
        }
      };

      // send it
      mailer.send(mailData, function(err, info) {
        if(err) { return callback(err); }
        callback(err, userModel);
      });

    });
  }

}


module.exports = UsersActivationController;

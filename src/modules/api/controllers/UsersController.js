'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  objectid        = require('mongodb').ObjectID,
  errors          = require('src/lib/errors'),

  // API utilities
  Request         = require('../util/Request'),
  Response        = require('../util/Response'),
  ExpandsURLMap   = require('../util/ExpandsURLMap'),

  // Base class
  BaseController  = require('./BaseController'),

  // Model managed by this controller
  User            = require('../models/User'),
  Admin           = require('../models/Admin'),
  Manager         = require('../models/Manager');


/**
 * UsersController
 */
class UsersController extends BaseController
{
  constructor(userType) {
    super();

    // set the user type
    var userModel = null;

    switch(userType) {
      case 'admin':
        userModel = Admin;
        break;
      case 'manager':
        userModel = Manager;
        break;
      default:
        userModel = User;
    }

    /**
     * @type {Model}
     */
    this.Model = userModel;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({
      "profile": {
        "route": null,
        "expands": {
          "image": {
            "route": "/uploads/:itemId",
            "expands": {"id":null}
          }
        }
      }
    });
  }


  /**
   * Create a new User
   */
  create(req, res, next) {
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = null,

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request),

      Model = this.Model;

    async.waterfall([
      function setup(callback) {
        var model = new Model(newAttrs);

        if(request.req.body.role) {
          model.role = request.req.body.role;
        }

        if(request.req.body.password) {
          model.password = request.req.body.password;
        }

        callback(null, model, waterfallOptions);
      },
      this._setProfile.bind(this),
      this._validate,
      this._save

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
   * Update a User
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch),

      Model = this.Model;

    async.waterfall([
      function setup(callback) {
        Model.findOne(criteria).exec(function(err, userModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!userModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          userModel.set(newAttrs);

          callback(null, userModel, waterfallOptions);
        });
      },
      this._setProfile.bind(this),
      this._updatePassword,
      this._validate,
      this._save

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

  _parseFilters(request) {
    var
      // get the regular filters (on safe attributes)
      defaultFilters    = super._parseFilters(request),
      additionalFilters = {};

    if(_.has(request.filters, 'role')) {
      additionalFilters = {'role': request.filters.role};
    }

    return _.extend({}, defaultFilters, additionalFilters);
  }


  _buildWaterfallOptions(postData) {
    var options = {};

    if(!_.isUndefined(postData.password)) {
      options.password = {
        newPassword: postData.password,
        oldPassword: postData.oldPassword || ''
      };
    }

    if(!_.isUndefined(postData.profile)) {
      options.profile = postData.profile;
    }

    return options;
  }


  _updatePassword(model, options, callback) {
    if(_.isUndefined(options.password)) {
      callback(null, model, options);
    } else {
      var p = options.password;

      // this will validate the old password and trigger an error if appropiate
      model.setPassword(p.newPassword, p.oldPassword, function(err) {
        callback(err, model, options);
      });
    }
  }


  _setProfile(model, options, callback) {
    options = options || {};

    if(_.isUndefined(options.profile)) {
      callback(null, model, options);
    } else {

      // convert to a JSON if the received value is a astringified JSON
      // (this might happen with POSTMAN)
      if(_.isString(options.profile)) {
        try {
          options.profile = JSON.parse(options.profile);
        } catch(e) {
          return callback( errors.Validation(model, 'attachments', 'Attachments must be a valid JSON') );
        }
      }

      var
        self    = this,
        profile = model.profile || {};

      _.keys(options.profile).forEach(function(key) {
        let val = options.profile[key];

        if(key === 'image') {
          val = self._getProfileImageValue(val);
        }

        profile[key] = val;
      });

      model.set({profile: profile});

      callback(null, model, options);
    }
  }


  _getProfileImageValue(imageValue) {
    var img;

    // set the custom image
    if(!_.isUndefined(imageValue) && !_.isEmpty(imageValue)) {
      try {
        // accept upload objects, or just the id as a string
        let imgId = _.isObject(imageValue) ? imageValue.id : imageValue;
        img = objectid(imgId);
      } catch (e) {}
    }

    return img;
  }

}


module.exports = UsersController;

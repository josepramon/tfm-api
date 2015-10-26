'use strict';

var
  _        = require('lodash'),
  async    = require('async'),
  ObjectId = require('mongoose').Types.ObjectId,
  config   = require('src/config'),
  cache    = require('./cache'),
  Role     = require('../models/Role'),

  cachePrefix = 'role_';


/**
 * Utility to retrieve some role by its name
 *
 * This is frequently used in middlewares (for access control purposes,
 * to inject some default parameters, etc).
 *
 * It will attempt to retrieve the data from the cache (redis), and if not
 * found, then the database will be queried (and the results cached)
 *
 * @param {String}   roleName
 * @param {Function} callback
 */
var getRoleByName = function(roleName, callback) {
  if(!roleName) {
    // no role
    callback(null);
  } else {
    async.waterfall([

      // try to retrieve it from redis
      function (cb) {
        cache.get(cachePrefix + roleName, function(err, roleModel) {
          cb(err, roleModel);
        });
      },

      // if not found in redis, retrieve from mongo
      function (roleModel, cb) {
        if(roleModel) {
          cb(null, roleModel);
        } else {

          Role.findOne({ name: roleName }).exec(function(err, roleModel) {
            /* istanbul ignore next */
            if (err) { return cb(err); }

            var key = cachePrefix + roleName;
            cache.set(key, roleModel); // no need to wait for the callback

            // make the key expire in 2 hours
            cache.expire(key, 2*60*60);

            cb(null, roleModel);
          });
        }
      }

    ], function asyncComplete(err, roleModel) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, roleModel);
    });
  }
};


/**
 * Aux. method to generate an async callback that returns the role id
 */
var getIdCb = function(role) {
  return function(callback) {
    getRoleByName(role, function(err, model) {
      if(err) { return callback(null); }
      callback(new ObjectId(model.id));
    });
  };
};

module.exports = {
  getRoleByName: getRoleByName,
  getIdCb: getIdCb
};

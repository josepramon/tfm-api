'use strict';

var
  _      = require('lodash'),
  client = require('src/lib/db/redis');


var cacheGet = function(key, callback) {
  var ret = null;

  client.get(key, function (err, reply) {
    if (err) { callback(err); }

    if(!_.isNull(reply)) {
      ret = JSON.parse(reply);
    }

    callback(null, ret);
  });
};


var cacheSet = function(key, data, callback) {
  client.set(key, JSON.stringify(data), function (err, reply) {
    if (err) { callback(err); }
    if(callback) { callback(null); }
  });
};


var cacheExpire = function(key, ttl) {
  client.expire(key, ttl);
};

module.exports = {
  get:    cacheGet,
  set:    cacheSet,
  expire: cacheExpire
};

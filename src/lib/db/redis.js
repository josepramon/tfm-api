'use strict';

var
  config = require('src/config'),
  redis  = require('redis'),
  client = redis.createClient(config.redis.port, config.redis.host);

if(config.redis.db) {
  client.select(config.redis.db);
}

if(config.redis.password) {
  client.auth(config.redis.password);
}

module.exports = client;

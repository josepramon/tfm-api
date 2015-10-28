'use strict';

/*
 * Token based auth.
 *
 * Based on:
 * [Express4 + Mongoose + JSON Web Token Authentication](http://blog.matoski.com/articles/jwt-express-node-mongoose)
 *
 */

var
  _            = require('lodash'),
  debug        = require('debug')('ApiApp:jwtAuth:' + process.pid),
  unless       = require('express-unless'),
  jsonwebtoken = require('jsonwebtoken'),
  errors       = require('./errors'),
  redis        = require('redis'),
  config       = require('src/config'),
  client       = redis.createClient(config.redis.port, config.redis.host),

  TOKEN_EXPIRATION     = 60 * 60, // 1 hour
  JWT_SECRET           = config.jwtSecret;



/**
 * Retrieve the authorization token from the request headers
 * @param  {Object} headers Request headers
 * @return {String}         The authorization token
 */
var fetch = function (headers) {
  var authorization, part, ret = null;

  if (headers && headers.authorization) {
    authorization = headers.authorization;

    // the header should be something like 'Bearer {{token}}'
    // so get only the last part, the actual token
    part = authorization.split(' ');

    if (part.length === 2) {
      ret = part[1];
    }
  }

  return ret;
};


/*
 * Token generation:
 *
 * When a token is created it gets saved to Redis so it can be revoked
 * before its expiration time.
 * I know that JWT does not require to store the tokens on the server, but this
 * gives us extra flexibility because any token can be revoked just removing it
 * from redis.
 *
 * @param  {Object}   user User model
 * @param  {Object}   req  Request
 * @param  {Object}   res  Response
 * @param  {Function} next
 * @return {Object}
 */
var create = function (user, req, res, next) {

  debug('Create token');

  if (_.isEmpty(user)) {
    return next(new Error('User data cannot be empty.'));
  }

  var userRole = user.role || {};

  var data = {
    id:         user.id,
    userModel:  user,
    role:       userRole.name,
    privileges: userRole.privileges,

    token: jsonwebtoken.sign({ id: user.id}, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION
    })
  };

  var decoded = jsonwebtoken.decode(data.token);

  // attach the expiration date and the iat (token issue date)
  // so the client can decide when to renew the token
  data.token_exp = decoded.exp;
  data.token_iat = decoded.iat;

  debug('Token generated for user: %s, token: %s', data.username, data.token);

  client.set(data.token, JSON.stringify(data), function (err, reply) {
    /* istanbul ignore next */
    if (err) {
      return next(new Error(err));
    }

    /* istanbul ignore else */
    if (reply) {
      client.expire(data.token, TOKEN_EXPIRATION, function (err, reply) {
        /* istanbul ignore next */
        if (err) {
          return next(new Error('Can not set the expire value for the token key'));
        }

        /* istanbul ignore else */
        if (reply) {
          req.user = data;
          next(); // we have succeeded
        } else {
          return next(new Error('Expiration not set on redis'));
        }
      });

    } else {
      return next(new Error('Token not set in redis'));
    }
  });

  return data;
};


/**
 * Retrieve a token from redis
 * @param  {String}   id   token id
 * @param  {Function} done callback
 */
var retrieve = function (id, done) {

  debug('Calling retrieve for token: %s', id);

  if (_.isNull(id)) {
    return done(new Error('token_invalid'), {
      'message': 'Invalid token'
    });
  }

  client.get(id, function (err, reply) {
    /* istanbul ignore next */
    if (err) {
      return done(err, { 'message': err });
    }

    if (_.isNull(reply)) {
      return done(new Error('token_invalid'), {
        'message': "Token doesn't exists, are you sure it hasn't expired or been revoked?"
      });
    } else {
      var data = JSON.parse(reply);
      debug('User data fetched from redis store for user: %s', data.username);

      /* istanbul ignore else */
      if (_.isEqual(data.token, id)) {
        return done(null, data);
      } else {
        return done(new Error('token_doesnt_exist'), {
          'message': "Token doesn't exists, login into the system so it can generate new token."
        });
      }

    }

  });

};


/**
 * Token verification
 * @param  {Object}   req  Request
 * @param  {Object}   res  Response
 * @param  {Function} next
 * @return {Object}
 */
var verify = function (req, res, next) {
  debug('Verifying token');

  var token = fetch(req.headers);

  jsonwebtoken.verify(token, JWT_SECRET, function (err, decode) {
    /* istanbul ignore next */
    if (err) {
      req.user = undefined;
      return next(new errors.Unauthorized('invalid_token'));
    }
    retrieve(token, function (err, data) {
      if (err) {
        req.user = undefined;
        return next(new errors.Unauthorized('invalid_token', data));
      }
      req.user = data;
      next();
    });
  });
};


/**
 * Force expire a token (by removing it from redis)
 * @param  {String} headers Request headers
 * @return {Boolean}
 */
var expire = function (headers) {
  var token = fetch(headers);

    debug('Expiring token: %s', token);

    if (token !== null) {
        client.expire(token, 0);
    }

    return token !== null;
};


var middleware = function () {
  var func = verify;
  func.unless = unless;
  return func;

};


module.exports = {
  fetch      : fetch,
  create     : create,
  retrieve   : retrieve,
  verify     : verify,
  expire     : expire,
  middleware : middleware
};

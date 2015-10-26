'use strict';

var
  _     = require('lodash'),
  async = require('async');


/**
 * Inject additional parameters to the req.body
 *
 * Warning: This is only for simple parameter injection, not for complex
 * nested objects, so if the req.body is `{ foo: 1, bar: {baz:1, qux: 2} }`
 * and the params is `{ bar: {baz:2} }`, the result will be:
 * `{foo: 1, bar: {baz: 2}}`
 * An implementation with deep nesting support could be possible, but it's
 * not needed.
 *
 * @param {Object}  params   New parameters to add to the req.body
 * @param {Boolean} override If true, the new parameters will override
 *                           any preexisting key with the sam name
 */
var injectParams = function(params, override, req, res, next) {
  req.body = req.body || {};

  // the filters values might be functions (to retrieve stuff from the DB,
  // or for whatever reason). So execute them if any.
  async.forEachOf(params, function (value, key, cb) {

    if(!_.isFunction(value)) {
      cb();
    } else {
      value(function(data) {
        params[key] = data;
        cb();
      });
    }

  }, function(err) {
    /* istanbul ignore next */
    if (err) { return next(err); }

    if(override) {
      _.extend(req.body, params);
    } else {
      _.defaults(req.body, params);
    }

    next();
  });
};


module.exports = {
  middleware: injectParams,
};

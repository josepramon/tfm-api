'use strict';

var MongooseError = require('mongoose').Error;
require('extend-error');

module.exports = {
  App :         Error.extend('AppError',          500),
  NotFound:     Error.extend('HttpNotFoundError', 404),
  Unauthorized: Error.extend('HttpUnauthorized',  401),

  Validation : function(model, attribute, message) {
    var err = new MongooseError.ValidationError(model);
    err.errors[attribute] = new MongooseError.ValidatorError({
      message: message,
      kind: 'not valid',
      path: attribute
    });
    return err;
  }
};

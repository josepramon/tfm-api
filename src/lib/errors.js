'use strict';

var MongooseError = require('mongoose').Error;
require('extend-error');

module.exports = {
  App :         Error.extend('AppError',          500),
  NotFound:     Error.extend('HttpNotFoundError', 404),
  Unauthorized: Error.extend('HttpUnauthorized',  401),
  BadRequest:   Error.extend('HttpBadRequest',    400),

  /**
   * Custom validation error
   */
  Validation : function(model, attribute, message) {
    var err = new MongooseError.ValidationError(model);
    err.errors[attribute] = new MongooseError.ValidatorError({
      message: message,
      kind: 'not valid',
      path: attribute
    });
    return err;
  },

  /**
   * Unique constraint error
   *
   * Generally this should not be used directly, when attempting to save a model,
   * the validations are run and the appropiate errors are thrown, but sometimes
   * it may be necessary to check for some attribute uniqueness and throw an error
   * without actually saving the model.
   */
  UniqueKey: function(model, attribute, message) {

    var
      db         = model.db.name,
      collection = model.collection,
      msg        = 'E11000 duplicate key error index: ' + db + '.' + collection + '.$' + attribute + '_1 dup key';

    var err = new MongooseError(msg);

    err.code = 11000;

    return err;
  }

};

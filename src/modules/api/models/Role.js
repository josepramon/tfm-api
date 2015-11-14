'use strict';

/**
 * Role model
 * ------------
 * Determines the user privileges
 */

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema;


var UserRoleSchema = new Schema({

  name: {
    type: String,
    unique: true,
    required: true
  },

  privileges: Schema.Types.Mixed

}, {

  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toObject: {
    virtuals: true,
    transform: /* istanbul ignore next */ function(doc, ret) {
      // transform id to _id
      ret._id = ret.id;
      delete ret.id;
    }
  }

});

/* istanbul ignore next */
var UserRoleModel = mongoose.models.Role ?
  mongoose.model('Role') : mongoose.model('Role', UserRoleSchema);

module.exports = UserRoleModel;

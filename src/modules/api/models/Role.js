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

});

/* istanbul ignore next */
var UserRoleModel = mongoose.models.Role ?
  mongoose.model('Role') : mongoose.model('Role', UserRoleSchema);

module.exports = UserRoleModel;

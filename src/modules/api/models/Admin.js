'use strict';

/**
 * Admin user class
 * @extends UserBase
 */

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  UserModel = require('./UserBase');


var
  options     = { discriminatorKey: '_kind' },
  AdminSchema = new Schema({});


/* istanbul ignore next */
var AdminModel = mongoose.models.Admin ?
  mongoose.model('Admin') : UserModel.discriminator('Admin', AdminSchema);


module.exports = AdminModel;

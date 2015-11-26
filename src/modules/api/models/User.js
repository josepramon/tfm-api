'use strict';

/**
 * Regular user class
 * @extends UserBase
 */

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  UserModel = require('./UserBase');


var UserSchema = new Schema({});


/* istanbul ignore next */
var UserModel = mongoose.models.User ?
  mongoose.model('User') : UserModel.discriminator('User', UserSchema);


module.exports = UserModel;

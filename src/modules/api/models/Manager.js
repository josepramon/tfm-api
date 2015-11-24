'use strict';

/**
 * Manager user class
 * @extends UserBase
 */

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  UserModel = require('./UserBase');


var
  options       = { discriminatorKey: '_kind' },
  ManagerSchema = new Schema({
    ticketCategories: String
  });


/* istanbul ignore next */
var ManagerModel = mongoose.models.Manager ?
  mongoose.model('Manager') : UserModel.discriminator('Manager', ManagerSchema);


module.exports = ManagerModel;

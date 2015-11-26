'use strict';

/**
 * Manager user class
 * @extends UserBase
 */

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  UserModel = require('./UserBase');


var ManagerSchema = new Schema({
  // categories available to the manager
  ticketCategories: []
});
  });


/* istanbul ignore next */
var ManagerModel = mongoose.models.Manager ?
  mongoose.model('Manager') : UserModel.discriminator('Manager', ManagerSchema);


module.exports = ManagerModel;

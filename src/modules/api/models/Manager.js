'use strict';

/**
 * Manager user class
 * @extends UserBase
 */

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  UserModel = require('./UserBase'),
  TicketCategory;


var ManagerSchema = new Schema({
  // categories available to the manager
  ticketCategories: []
});


// Remove relations from other collections on delete
// ---------------------------------------------------

// unassign from tickets categories
ManagerSchema.pre('remove', function (next) {
  var
    manager  = this,
    criteria = { _id: {$in: manager.ticketCategories} },
    update   = { $pull: { 'managers': manager._id } };


  // requiring at runtime to avoid circular dependencies
  TicketCategory = TicketCategory || require('../modules/tickets/models/Category');

  TicketCategory.update(criteria, update, {multi:true}, function(err, numAffected) {
    /* istanbul ignore next */
    if(err) { return next(err); }
    next();
  });
});


/* istanbul ignore next */
var ManagerModel = mongoose.models.Manager ?
  mongoose.model('Manager') : UserModel.discriminator('Manager', ManagerSchema);


module.exports = ManagerModel;

'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  dateUtil = require('src/lib/dateUtil'),
  Manager, Ticket;


/**
 * Tickets category/department
 */
var CategorySchema = new Schema({
  name         : { type: String, required: true, unique: true },
  description  : String,
  managers     : [{ type: Schema.ObjectId, ref: 'Manager'}],
  created_at   : { type: Date, default: Date.now },
  updated_at   : { type: Date, default: Date.now }
}, {

  toJSON: {
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.__v;

      // convert the dates to timestamps
      ret.created_at   = dateUtil.dateToTimestamp(ret.created_at);
      ret.updated_at   = dateUtil.dateToTimestamp(ret.updated_at);
    }
  },

  'collection': 'tickets.categories'

});



// Remove relations from other collections on delete
// ---------------------------------------------------
CategorySchema.pre('remove', function (next) {
  var
    category = this,
    criteria = {},
    update   = { category: null };


  // requiring at runtime to avoid circular dependencies
  Ticket = Ticket || require('./Ticket');

  Ticket.update(criteria, update, {multi:true}, function(err, numAffected) {
    /* istanbul ignore next */
    if(err) { return next(err); }
    next();
  });
});

CategorySchema.pre('remove', function (next) {
  var
    category = this,
    criteria = {},
    update   = { $pull: { 'ticketCategories': category._id } };


  // requiring at runtime to avoid circular dependencies
  Manager = Manager || require('../../../models/Manager');

  Manager.update(criteria, update, {multi:true}, function(err, numAffected) {
    /* istanbul ignore next */
    if(err) { return next(err); }
    next();
  });
});


// Secondary indexes
// ----------------------------------
CategorySchema.index({ managers: 1 });


// Custom methods and attributes
// ----------------------------------
CategorySchema.statics.safeAttrs = ['name', 'description'];
CategorySchema.methods.getRefs = function() { return ['managers']; };


// Register the plugins
// ----------------------------------
CategorySchema.plugin( require('mongoose-paginate') );
CategorySchema.plugin( require('mongoose-deep-populate')(mongoose) );
CategorySchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var TicketCategoryModel = mongoose.models.TicketsCategory ?
  mongoose.model('TicketsCategory') : mongoose.model('TicketsCategory', CategorySchema);


module.exports = TicketCategoryModel;

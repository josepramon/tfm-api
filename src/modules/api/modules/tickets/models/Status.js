'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  dateUtil = require('src/lib/dateUtil'),
  Ticket;


/**
 * Tickets statuses
 */
var StatusSchema = new Schema({
  name         : { type: String, required: true, unique: true },
  description  : String,

  // used to define a sequence (open -> in progress -> closed)
  order        : { type: Number, required: true, default: 0 },

  // The ticket resolution flow can be customized,
  // by defining the statates that can be applied to the ticket.
  // There are two special statuses, the 'open' and 'closed' ones,
  // that should exist always, so it should not deleteable.
  open         : { type: Boolean, default: false, unique: true },
  closed       : { type: Boolean, default: false, unique: true },

  created_at   : { type: Date, default: Date.now },
  updated_at   : { type: Date, default: Date.now }

}, {

  toJSON: {
    virtuals: true,
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

  'collection': 'tickets.statuses'

});



// Remove relations from other collections
StatusSchema.pre('remove', function (next) {
  var
    tag      = this,
    criteria = {},
    update   = { $pull: { 'tags': tag._id } };


  // requiring at runtime to avoid circular dependencies
  Ticket = Ticket || require('./Ticket');

  Ticket.update(criteria, update, {multi:true}, function(err, numAffected) {
    /* istanbul ignore next */
    if(err) { return next(err); }
    next();
  });
});


// Secondary indexes
// ----------------------------------
StatusSchema.index({ managers: 1 });


// Custom methods and attributes
// ----------------------------------
StatusSchema.statics.safeAttrs = ['name', 'description', 'order'];
StatusSchema.methods.getRefs = function() { return []; };

StatusSchema.virtual('deleteable')
  .get(function () {
    return !this.open && !this.closed;
  }
);


// Register the plugins
// ----------------------------------
StatusSchema.plugin( require('mongoose-paginate') );
StatusSchema.plugin( require('mongoose-deep-populate')(mongoose) );
StatusSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var TicketStatusModel = mongoose.models.TicketsStatus ?
  mongoose.model('TicketsStatus') : mongoose.model('TicketsStatus', StatusSchema);


module.exports = TicketStatusModel;

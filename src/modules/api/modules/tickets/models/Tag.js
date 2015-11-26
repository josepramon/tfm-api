'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  dateUtil = require('src/lib/dateUtil'),
  Ticket;


var TagSchema = new Schema({
  name         : { type: String, required: true, unique: true },
  description  : String,
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

  'collection': 'tickets.tags'

});


// Remove relations from other collections
TagSchema.pre('remove', function (next) {
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
TagSchema.index({
  name:        'text',
  description: 'text'
}, {
  weights: {
    name:        5,
    description: 1
  },
  name: 'TagsTextIndex'
});


// Custom methods and attributes
// ----------------------------------
TagSchema.statics.safeAttrs = ['name', 'description'];
TagSchema.methods.getRefs = function() { return []; };


// Register the plugins
// ----------------------------------
TagSchema.plugin( require('mongoose-paginate') );
TagSchema.plugin( require('mongoose-deep-populate')(mongoose) );
TagSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var TagModel = mongoose.models.TicketsTag ?
  mongoose.model('TicketsTag') : mongoose.model('TicketsTag', TagSchema);


module.exports = TagModel;

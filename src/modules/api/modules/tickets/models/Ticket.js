'use strict';

var
  _        = require('underscore'),
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  shortid  = require('shortid'),
  dateUtil = require('src/lib/dateUtil'),

  // nested schemas
  AttachmentSchema = require('../../../models/schemas/Attachment'),
  CommentSchema    = require('./schemas/Comment'),
  StatusSchema     = require('./schemas/Status');


/**
 * Custom shortId generator for the ticket IDs
 *
 * Generates a unique shortId for the ticket (because the ticket id is displayed
 * to the user, so regular objectIds are too complicated). The method ensures the
 * id has no dashes because the index is indexed in a full text index, and the dashes
 * are treated as delimiters by mongo
 *
 * @return {String}
 */
var generateId = function() {
  var id;

  do {
    id = shortid.generate();
  } while ( id.search(/_|-/) > -1 );

  return id;
};


/**
 * Ticket schemma
 * @type {Schema}
 */
var TicketSchema = new Schema({

  _id:         { type: String, unique: true, 'default': generateId },

  title:       { type: String, required: true },
  body:        { type: String, required: true },

  comments:    [CommentSchema],
  attachments: [AttachmentSchema],
  statuses:    [StatusSchema],

  tags:        [{ type: Schema.ObjectId, ref: 'TicketsTag' }],
  category:    { type: Schema.ObjectId, ref: 'TicketsCategory' },

  user:        { type: Schema.ObjectId, ref: 'User', required: true },
  manager:     { type: Schema.ObjectId, ref: 'Manager' },

  // priorities, defined as number to make it easier the sorting
  // 4: critical
  // 3: hight
  // 2: normal
  // 1: low
  priority:    { type: Number, enum: [4,3,2,1], default: 2 },

  closed:      { type: Boolean, default: false },

  created_at:  { type: Date, default: Date.now },
  updated_at:  { type: Date, default: Date.now }

}, {

  toObject: { virtuals: true },

  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.__v;

      // convert the dates to timestamps
      ret.created_at = dateUtil.dateToTimestamp(ret.created_at);
      ret.updated_at = dateUtil.dateToTimestamp(ret.updated_at);
    }
  },

  'collection': 'tickets.tickets'

});


// Secondary indexes
// ----------------------------------
TicketSchema.index({ tags: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ user: 1 });
TicketSchema.index({ manager: 1 });

TicketSchema.index({
  _id:                'text',
  title:              'text',
  body:               'text',
  'comments.comment': 'text'
}, {
  weights: {
    _id:                5,
    title:              5,
    body:               3,
    'comments.comment': 1
  },
  name: 'TicketsTextIndex'
});

// Custom methods and attributes
// ----------------------------------
TicketSchema.statics.privateAttrs = ['tags', 'priority', 'comments[private=true]'];
TicketSchema.statics.safeAttrs    = ['title', 'body', 'priority'];
TicketSchema.methods.getRefs      = function() { return ['tags', 'category', 'attachments', 'comments', 'statuses', 'user', 'manager']; };


// Register the plugins
// ----------------------------------
TicketSchema.plugin( require('mongoose-paginate') );
TicketSchema.plugin( require('mongoose-deep-populate')(mongoose) );
TicketSchema.plugin( require('mongoose-time')() );
TicketSchema.plugin( require('mongoose-autopopulate') );


/* istanbul ignore next */
var TicketModel = mongoose.models.Ticket ?
  mongoose.model('Ticket') : mongoose.model('Ticket', TicketSchema);


module.exports = TicketModel;

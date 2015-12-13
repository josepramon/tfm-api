'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

/**
 * Status schema
 */
var StatusSchema = new Schema({

  status:     { type: Schema.ObjectId, ref: 'TicketsStatus', required: true, autopopulate: true },
  user:       { type: Schema.ObjectId, ref: 'UserBase', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  comments:   { type: String }

}, {

  toJSON: {
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.__v;
    }
  }

});


StatusSchema.plugin( require('mongoose-deep-populate')(mongoose) );
StatusSchema.plugin( require('mongoose-time')() );
StatusSchema.plugin( require('mongoose-autopopulate') );

module.exports = StatusSchema;

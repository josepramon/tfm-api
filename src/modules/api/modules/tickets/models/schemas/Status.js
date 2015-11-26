'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

/**
 * Status schema
 */
var StatusSchema = new Schema({

  status:     { type: Schema.ObjectId, ref: 'Status', required: true },
  user:       { type: Schema.ObjectId, ref: 'UserBase', required: true },
  created_at: { type: Date, default: Date.now }

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

module.exports = StatusSchema;

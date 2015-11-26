'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

/**
 * Private note schema
 *
 * Not a regular model, just a schema
 * (Notes don't exist on their own, they're embedded)
 */
var NoteSchema = new Schema({

  comment:    { type: String, required: true },
  user:       { type: Schema.ObjectId, ref: 'Manager', required: true },
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

module.exports = NoteSchema;

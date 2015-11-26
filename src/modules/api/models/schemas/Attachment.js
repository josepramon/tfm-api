'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema;

/**
 * Attachment schema
 *
 * Not a regular model, just a schema
 * (attachments don't exist on their own, they're embedded)
 */
var AttachmentSchema = new Schema({

  name:        { type: String, required: true },
  description: { type: String },
  upload:      { type: Schema.ObjectId, ref: 'Upload', required: true }

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

module.exports = AttachmentSchema;

'use strict';

var
  mongoose         = require('mongoose'),
  Schema           = mongoose.Schema,
  dateUtil         = require('src/lib/dateUtil'),
  AttachmentSchema = require('../../../../models/schemas/Attachment');

/**
 * Comment schema
 *
 * Not a regular model, just a schema
 * (comments don't exist on their own, they're embedded inside a ticket)
 */
var CommentSchema = new Schema({

  comment:     { type: String, required: true },
  user:        { type: Schema.ObjectId, ref: 'UserBase', required: true },
  attachments: [AttachmentSchema],
  private:     { type: Boolean, default: false },

  created_at:  { type: Date, default: Date.now },
  updated_at:  { type: Date, default: Date.now }

}, {

  toJSON: {
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
  }

});


CommentSchema.methods.getRefs = function() { return ['user', 'attachments']; };
CommentSchema.plugin( require('mongoose-deep-populate')(mongoose) );
CommentSchema.plugin( require('mongoose-time')() );

module.exports = CommentSchema;

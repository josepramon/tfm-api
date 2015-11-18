'use strict';

var
  mongoose  = require('mongoose'),
  Schema    = mongoose.Schema,
  dateUtil  = require('src/lib/dateUtil'),
  uploadsFs = require('../util/uploader/uploadsFs');


/**
 * Upload model
 * ------------
 * Generic upload model
 */
var UploadSchema = new Schema({

  // hostname, where the file is stored (for external storage solutions, like S3)
  host: { type: String },

  // full url path to the file, relative to the root
  path: { type: String, required: true },

  contentType: {  type: String },

  size: { type: Number },

  // only for local files
  realPath: { type: String },

  // dates
  created_at : { type: Date, default: Date.now },
  updated_at : { type: Date, default: Date.now },

  // owner (the user that uploaded the file)
  owner : { type: Schema.ObjectId, ref: 'User', required: true }

}, {

  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.realPath;
      delete ret.owner;
      delete ret.__v;

      // convert the dates to timestamps
      ret.created_at = dateUtil.dateToTimestamp(ret.created_at);
      ret.updated_at = dateUtil.dateToTimestamp(ret.updated_at);
    }
  },
  toObject: {
    virtuals: true,
    transform: /* istanbul ignore next */ function(doc, ret) {
      // transform id to _id
      ret._id = ret.id;
      delete ret.id;
    }
  }

});


// Custom methods and attributes
// ----------------------------------
UploadSchema.virtual('url').get(function () {
  return 'http://' + this.host + '/' + this.path;
});

UploadSchema.methods.deleteFile = function(next) {
  var upload = this;

  var path = !!upload.realPath ? upload.realPath : upload.path;

  if(!!path) {
    uploadsFs.unlink(path, next);
  } else {
    next();
  }
};

// Secondary indexes
// ----------------------------------
// host + path must be unique
UploadSchema.index({ host: 1, path: 1}, { unique: true });


// Register the plugins
// ----------------------------------
UploadSchema.plugin( require('mongoose-paginate') );
UploadSchema.plugin( require('mongoose-time')() );


// Hooks
// ----------------------------------
UploadSchema.pre('remove', function(next) {
  this.deleteFile(next);
});


/* istanbul ignore next */
var UploadModel = mongoose.models.Upload ?
  mongoose.model('Upload') : mongoose.model('Upload', UploadSchema);

module.exports = UploadModel;

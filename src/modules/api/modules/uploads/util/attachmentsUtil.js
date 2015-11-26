'use strict';

var
  _        = require('underscore'),
  errors   = require('src/lib/errors'),
  objectid = require('mongodb').ObjectID;



module.exports = {

  /**
   * Set the attachments for some model
   *
   * (the attachments are wrappers for the Upload model, with some additional metadata)
   *
   * The removed files are not deleted here (from the disk, S3 or whateer)
   * because the file might be referenced elsewhere.
   *
   * TODO: create a cron to check for unreferenced files and delete them
   */
  setAttachments(model, options, callback) {
    if(_.isUndefined(options.attachments)) {
      callback(null, model, options);
    } else {

      let attachments = options.attachments;

      if(!_.isObject(attachments)) {
        try {
          attachments = JSON.parse(attachments);
        } catch(e) {
          return callback( errors.Validation(model, 'attachments', 'Attachments must be a valid JSON') );
        }
      }

      let parsed = [];

      if(_.isArray(attachments)) {
        parsed = attachments.map(function(attachment) {
          let parsedAttachment = _.pick(attachment, 'name', 'description');

          if(attachment.upload && attachment.upload.id) {
            parsedAttachment.upload = objectid(attachment.upload.id);
          } else if(attachment.uploadId) {
            // simplified version
            parsedAttachment.upload = objectid(attachment.uploadId);
          }

          return parsedAttachment;
        });
      }

      // update the article attachments
      model.set('attachments', parsed);

      callback(null, model, options);
    }
  }
};

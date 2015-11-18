'use strict';

var
  s3         = require('multer-s3'),
  uniqueName = require('../uniqueNameGenerator');


/**
 * Amazon S3 storage system for the multer uploader
 */
module.exports = function(config) {

  if(!config || !!(config.s3 && config.uploads && config.uploads.model === 's3')) {
    throw new Error('Bad S3 config');
  }

  return s3({
    secretAccessKey: config.s3.accessKey,
    accessKeyId:     config.s3.accessKeyId,
    region:          config.s3.region,

    bucket:          config.uploads.bucket,
    dirname:         config.uploads.path,

    contentType:     s3.AUTO_CONTENT_TYPE,
    filename:        uniqueName
  });
};

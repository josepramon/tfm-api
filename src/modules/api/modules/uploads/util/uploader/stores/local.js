'use strict';

var
  multer     = require('multer'),
  uniqueName = require('../uniqueNameGenerator');


/**
 * Local storage system for the multer uploader
 */
module.exports = function(config) {

  if(!config || !!(config.uploads && config.uploads.model === 'local')) {
    throw new Error('Bad uploads config');
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploads.dest);
    },
    filename: uniqueName
  });
};

'use strict';

var config = require('src/config');


/**
 * request.file normalization
 *
 * The fields contained in request.file are diferent
 * when using the various storage adapters
 */
module.exports = function(request) {

  if(!request.file) {
    return {};
  }

  // common parameters
  var ret = {
    contentType: request.file.mimetype,
    size:        request.file.size
  };

  if(config && config.uploads) {
    if(config.uploads.mode === 's3') {

      // Amazon S3 uploads
      ret.path   = request.file.key;
      ret.host   = config.uploads.host;
    } else {

      // local uploads
      ret.realPath = config.uploads.dest + '/' + request.file.filename;
      ret.path     = config.uploads.path + '/' + request.file.filename;
      ret.host     = config.uploads.host ? config.uploads.host : request.headers.host;
    }
  } else {

    // in memory uploads...
    ret.path = null;
    ret.host = null;
  }

  return ret;
};

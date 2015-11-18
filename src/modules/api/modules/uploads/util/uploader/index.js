'use strict';

/**
 * Multer instantiation (based on the config)
 *
 * Creates the multer instance that handles the uploads,
 * setting the appropiate storage system (local or S3)
 * according the configuration parameters.
 */
var
  config = require('src/config'),
  multer = require('multer'),
  opts = {};


if(config && config.uploads) {
  if(config.uploads.mode === 's3') {
    opts.storage = require('./stores/s3')(config);
  } else {
    opts.storage = require('./stores/local')(config);
  }
}

// if no config, in memory uploads will be used (WARNING: use this ONLY for tests)


module.exports = multer(opts);

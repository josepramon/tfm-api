'use strict';

var
  path    = require('path'),
  shortid = require('shortid');

/**
 * Simple unique name generator for the file uploads
 */
module.exports = function(req, file, cb) {
  var
    // create an unique file name
    filename = shortid.generate(),

    // get the file extension
    ext = path.extname(file.originalname);

  cb(null,  filename + ext);
};

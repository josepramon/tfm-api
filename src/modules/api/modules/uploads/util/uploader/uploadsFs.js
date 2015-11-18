/**
 * Simple filesystem abstraction for the file uploads (local and S3 based)
 */
var
  config = require('src/config'),
  fs;


if(config.uploads.mode === 's3') {
  var S3FS = require('s3fs');

  fs = new S3FS(config.uploads.bucket, {
    secretAccessKey: config.s3.accessKey,
    accessKeyId:     config.s3.accessKeyId,
    region:          config.s3.region
  });

} else {
  fs = require('fs');
}


module.exports = fs;

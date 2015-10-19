'use strict';

var
  fs        = require('fs'),
  express   = require('express'),
  publicDir = process.env.APP_PUBLIC_DIR,
  rootDir   = process.env.APP_ROOT;

module.exports = {
  root: function(req, res) {
    res.sendFile(publicDir + '/index.html', {root: rootDir});
  }
};

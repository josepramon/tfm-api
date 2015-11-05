'use strict';

// MONGO DATABASE DATA LOADING:
// -----------------------------------------------------------------------------
// Usage: node ./util/populateDB.js connectionName pathToDataFiles
//
// Where `connectionName` is a named connection in `env.json` or `env.default.json`
// and `pathToDataFiles` is the path to the directory containing the data files,
// relative to the project root.
var
  _      = require('underscore'),
  fs     = require('fs'),
  path   = require('path'),
  glob   = require('glob'),
  config = require('../src/config'),
  db, dataDir;


// GET THE DIRECTORY WHERE THE DATA IS DEFINED
// =============================================================================
var args = process.argv.slice(2);

var err = function(msg) {
  console.log('ERROR:', msg);
  process.exit();
};

if(args.length >= 2) {
  db = config.mongo[args[0]];
  if(!db) {
    err('"connectionName" not recognised.');
  }

  dataDir = path.normalize(__dirname + '/../' + args[1] + '/');

} else {
  err('not enough parameters supplied.');
}

// MONGO CONF:
// Get the connection params for the mongo instance
// =============================================================================
var mongoConfigParser = require('../src/lib/mongoConfigParser');

var mongoConn = new mongoConfigParser().setEnv({
  host     : db.host,
  port     : db.port,
  user     : db.user,
  password : db.password,
  database : db.database
});

// DATA LOAD:
// =============================================================================
var
  loader = require('pow-mongodb-fixtures').connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions()),
  data   = {};


glob(dataDir + '**/*.js', function (er, files) {
  files.forEach(function(file) {
    var fileNoExt = file.substr(0, file.indexOf('.')).replace(dataDir,'');
    data = _.extend(data, require(dataDir + fileNoExt));
  });
});

// load the data into the db
loader.clearAndLoad(data, function(err) {
  if (err) {
    console.log(err);
  }

  loader.close(function() {});
});

'use strict';

var
  fs          = require('fs'),
  path        = require('path'),
  glob        = require('glob'),
  config      = require('../src/config'),
  fixturesDir = path.normalize(__dirname + '/../test/fixtures/');


// MONGO CONF:
// Get the connection params for the mongo instance
// =============================================================================
var mongoConfigParser = require('../src/lib/mongoConfigParser');

var mongoConn = new mongoConfigParser().setEnv({
  host     : process.env.MONGO_HOST,
  port     : process.env.MONGO_PORT,
  user     : process.env.MONGO_USER,
  password : process.env.MONGO_PASSWORD,
  database : process.env.MONGO_DATABASE
});

// DATA LOAD:
// The collections must be defined inside the fixtures directory, one file
// per collection. The file name corresponds to the collection name.
// The file can be json file with the collection defined as an array or a node
// module that generates the collection.
//
// Example 1 (fixtures/foo.json):
// -------------------------------
//
// [
//   {
//     "name": "ItemName 1",
//     "description": "ItemDescription 1",
//     "active": true
//   },
//   {
//     "name": "ItemName 2",
//     "description": "ItemDescription 2",
//     "active": true
//   }
// ]
//
// Example 2 (fixtures/bar.js):
// -------------------------------
//
// module.exports = (function() {
//   'use strict';
//
//   var
//     faker = require('faker'),
//     data = [];
//
//
//   for(var i=0, l=100; i < l; i++) {
//     data.push({
//       "name"        : faker.company.companyName(),
//       "description" : faker.company.catchPhrase(),
//     });
//   }
//
//   return data;
//
// })();
//
// =============================================================================
var
  loader = require('pow-mongodb-fixtures').connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions()),
  data   = {};


glob(fixturesDir + '**/*.js', function (er, files) {
  files.forEach(function(fixture) {
    var
      fileNoExt      = fixture.substr(0, fixture.indexOf('.')).replace(fixturesDir,''),
      collectionName = fileNoExt.replace('/', '.');

    data[collectionName] = require(fixturesDir + fileNoExt);

    console.log('Loading "' + collectionName + '" collection. Inserting ' + data[collectionName].length + ' items.');
  });
});


// load the fixtures into the db
loader.clearAllAndLoad(data, function(err) {
  if (err) {
    console.log(err);
  }

  loader.close(function() {});
});

'use strict';

var
  fs                = require('fs'),
  path              = require('path'),
  mongoose          = require('mongoose'),
  mongoConfigParser = require('../src/lib/mongoConfigParser'),
  User              = require('../src/modules/api/models/User'),
  prompt            = require('prompt');


// Get the connection params for the mongo instance and connect
var mongoConn = new mongoConfigParser().setEnv({
  host     : process.env.MONGO_HOST,
  port     : process.env.MONGO_PORT,
  user     : process.env.MONGO_USER,
  password : process.env.MONGO_PASSWORD,
  database : process.env.MONGO_DATABASE
});


mongoose.set('debug', true);
mongoose.connection.on('error', function () {
    console.log('Mongoose connection error', arguments);
});


var createUser = function(userData) {

  // Connect to mongo
  mongoose.connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions());

  // Create the user
  mongoose.connection.once('open', function callback() {

    var user = new User(userData);

    user.save(function (err) {
      if (err) {
        console.log(err);
      }
      process.exit();
    });
  });
};


var args = process.argv.slice(2);

if(args.length && args[0] === '--default') {
  createUser({
    username: 'demo',
    password: 'demo',
    email:    'demo@demo.demo'
  });
} else {
  prompt.start().get(['username', 'password', 'email'], function (err, result) {
    createUser(result);
  });
}

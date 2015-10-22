'use strict';

var
  _                 = require('underscore'),
  fs                = require('fs'),
  path              = require('path'),
  mongoose          = require('mongoose'),
  mongoConfigParser = require('../src/lib/mongoConfigParser'),
  config            = require('../src/config'),
  User              = require('../src/modules/api/models/User'),
  Role              = require('../src/modules/api/models/Role'),
  inquirer          = require('inquirer');


// Get the connection params for the mongo instance and connect
var mongoConn = new mongoConfigParser().setEnv({
  host     : config.mongo.default.host,
  port     : config.mongo.default.port,
  user     : config.mongo.default.user,
  password : config.mongo.default.password,
  database : config.mongo.default.database
});


var errorHandler = function(err) {
  console.log('ERROR:', err);
  process.exit();
};

var getRoles = function(callback) {
  console.log('Retrieving roles...');

  Role.find({}, function(err, roles) {
    callback(err, roles);
  });
};

var createUser = function(userData) {
  var user = new User(userData);

  user.save(function (err, model) {
    if(err) {
      errorHandler(err);
    }
    console.log('User successfully created');
    process.exit();
  });

};

var getPromptQuestions = function(roleNames, roles) {
  return [
    {
      type: 'input',
      name: 'username',
      message: 'Insert username',
      validate: function(input) {
        if(input.length < 4) {
          return 'Username must be longer than 4 characters';
        }
        return true;
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Insert password',
      validate: function(input) {
        if(input.length < 8) {
          return 'Password must be longer than 8 characters';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Insert email',
      validate: function(input) {
        var pass = input.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
        if (pass) {
          return true;
        } else {
          return 'Please insert a valid email';
        }
      }
    },
    {
      type: 'list',
      name: 'role',
      message: 'Select a profile',
      choices: roleNames,
      filter: function(roleName) {
        var role = _.find(roles, function(role) {
          return role.name === roleName;
        });
        return role ? role.id : null;
      }
    }
  ];
};


mongoose.set('debug', true);
mongoose.connection.on('error', function () {
    console.log('Mongoose connection error', arguments);
});

// Connect to mongo
mongoose.connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions());


mongoose.connection.once('open', function callback() {
  getRoles(function(error, roles) {
    if (error) {
      errorHandler(error);
    }

    var
      keys       = 'abcdefgijklmnopq'.split(''),
      currentKey = 0;

    var roleNames = roles.map(function(role) { return role.name; });

    inquirer.prompt(getPromptQuestions(roleNames, roles), function(answers) {
      var params = {
        username: answers.username,
        password: answers.password,
        email:    answers.email,
        role:     answers.role
      };
      createUser(params);
    });

  });
});

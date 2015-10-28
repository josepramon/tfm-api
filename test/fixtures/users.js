'use strict';

var
  _      = require('underscore'),
  faker  = require('faker'),
  id     = require('pow-mongodb-fixtures').createObjectId,
  crypt  = require('../../src/lib/crypt'),
  config = require('../../src/config');

// User roles
var roles = exports.roles = require('../../data/roles').roles;

var getRoleIdByUniqueName = function(roleName) {
  var role = _.find(roles, function(role) {
    return role.name === roleName;
  });
  return role ? role.id : null;
};

// Get the role id's to set the appropiate relations
var
  adminRoleId   = getRoleIdByUniqueName(config.roles.admin),
  managerRoleId = getRoleIdByUniqueName(config.roles.manager),
  userRoleId    = getRoleIdByUniqueName(config.roles.user);

// Create the users
var users = [];

// default admin
users.push({
  _id:      id(),
  username: 'admin',
  password: crypt.hashPassword('admin1234'),
  email:    'admin@demo.demo',
  role:     adminRoleId
});

// default manager
users.push({
  _id:      id(),
  username: 'manager',
  password: crypt.hashPassword('manager1234'),
  email:    'manager@demo.demo',
  role:     managerRoleId
});

// default user
users.push({
  _id:      id(),
  username: 'user',
  password: crypt.hashPassword('user1234'),
  email:    'user@demo.demo',
  role:     userRoleId
});

// create more random users
for(var i=0, l=10; i < l; i++) {
  users.push({
    username : faker.internet.userName(),
    password : crypt.hashPassword(faker.internet.password()),
    email    : faker.internet.email(),
    role     : userRoleId
  });
}

exports.users = users;

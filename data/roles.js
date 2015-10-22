'use strict';

var
  id     = require('pow-mongodb-fixtures').createObjectId,
  config = require('../src/config');

exports.roles = [
  // admin role
  {
    id:         id(),
    name:       config.roles.admin,
    privileges: {}
  },

  // agent role
  {
    id:         id(),
    name:       config.roles.agent,
    privileges: {}
  },

  // user role
  {
    id:         id(),
    name:       config.roles.user,
    privileges: {}
  }
];

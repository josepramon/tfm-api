'use strict';

var
  id     = require('pow-mongodb-fixtures').createObjectId,
  config = require('../src/config');

exports.roles = [

  // admin role
  // ---------------------------------
  {
    id:         id(),
    name:       config.roles.admin,
    privileges: {

      // unlimited access
      users: true,

      // unlimited access
      knowledge_base: true

    }
  },

  // agent role
  // ---------------------------------
  {
    id:         id(),
    name:       config.roles.agent,
    privileges: {

      // unlimited access
      knowledge_base: true

    }
  },

  // user role
  // ---------------------------------
  {
    id:         id(),
    name:       config.roles.user,
    privileges: {

      // readonly
      knowledge_base: {
        actions: {
          read: true
        }
      }

    }
  }
];

'use strict';

var
  id     = require('mongodb').ObjectID,
  config = require('../src/config');

exports.roles = [

  // admin role
  // ---------------------------------
  {
    id:         new id(),
    name:       config.roles.admin,
    privileges: {

      // users management: unlimited access
      users: true,

      // managers (agents) management: unlimited access
      managers:true,

      // admins management: unlimited access
      admins:true,

      // knowledge base articles: unlimited access
      knowledge_base: true

    }
  },

  // manager role
  // ---------------------------------
  {
    id:         new id(),
    name:       config.roles.manager,
    privileges: {

      // unlimited access
      knowledge_base: true

    }
  },

  // user role
  // ---------------------------------
  {
    id:         new id(),
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

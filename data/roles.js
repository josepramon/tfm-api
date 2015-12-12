'use strict';

var
  id     = require('mongodb').ObjectID,
  config = require('../src/config');

exports.roles = [

  // admin role
  // ---------------------------------
  {
    _id:        new id(),
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

      // tickets
      tickets: {
        actions: {
          manageCategories: true,
          manageStatuses:   true
        }
      }

    }
  },

  // manager role
  // ---------------------------------
  {
    _id:        new id(),
    name:       config.roles.manager,
    privileges: {

      // unlimited access
      knowledge_base: true

      // tickets
      tickets: {
        actions: {
          manageTickets: true
        }
      }
    }
  },

  // user role
  // ---------------------------------
  {
    _id:        new id(),
    name:       config.roles.user,
    privileges: {

      // readonly
      knowledge_base: {
        actions: {
          read: true
        }
      }

      // tickets
      tickets: {
        actions: {
          // additional restrictions will prevent from accessing other user's tickets
          manageTickets: true
        }
      }

    }
  }
];

'use strict';

var
  id     = require('mongodb').ObjectID,
  config = require('../src/config');

/**
 * User roles
 * @type {Array}
 * @description Defines the application user types, and sets the privileges that
 * will allow/deny the access to some resources/actionson the API and/or the apps.
 * The restrictions are applied mostly on the applications, and the API modules may
 * use this restrictions on simple situations, or use custom middlewares for more
 * complex scenarios, for example when some route must be available to that role,
 * but not in a global way (for example the access to some particular docs should
 * be restricted)
 *
 */
exports.roles = [

  // Admin role (site admin)
  // ---------------------------------
  {
    _id:        new id(),
    name:       config.roles.admin,
    privileges: {

      // Users management:
      // --------------------
      //
      // unlimited access
      users: true,

      // Managers (agents) management:
      // -------------------------------
      //
      // unlimited access
      managers: true,

      // Admins management:
      // -------------------
      //
      // unlimited access
      admins: true,

      // Knowledge base:
      // -----------------
      //
      // unlimited access
      knowledge_base: true,

      // Tickets:
      // ---------
      //
      // The tickets module uses a special access filter.
      // The admins have unlimited access to all the actions on the API,
      // but on the dashboard, the access to the tickets management should be
      // restricted to managers. So instead of setting the privileges as global,
      // deffine the restrictions used on the applications (the API will not apply
      // this, only the apps).
      tickets: {
        actions: {
          stats:            true,
          manageCategories: true,
          manageStatuses:   true,
          uncategorised:    true
        }
      }

    }
  },

  // Manager role (employees)
  // ---------------------------------
  {
    _id:        new id(),
    name:       config.roles.manager,
    privileges: {

      // Users management:
      // --------------------
      //
      // read only, the managers can only list the users
      // (for example to obtain some stats)
      users: {
        actions: {
          read: true
        }
      },

      // Managers (agents) management:
      // -------------------------------
      //
      // read only, the managers can only list the amanagers
      // (for example to obtain some stats). Additionally, they can access their
      // own db record (to update the password for example)
      managers: {
        actions: {
          read: true
        }
      },

      // Knowledge base:
      // -----------------
      //
      // unlimited access
      knowledge_base: true,

      // Tickets:
      // ---------
      //
      // Access only to tickets management.
      // Additional restrictions provided by a custom middleware
      // will prevent from accessing tickets from unnassigned categories
      tickets: {
        actions: {
          stats:         true,
          manageTickets: true
        }
      }
    }
  },

  // User role (regular users)
  // ---------------------------------
  {
    _id:        new id(),
    name:       config.roles.user,
    privileges: {

      // Knowledge base:
      // -----------------
      //
      // read only
      knowledge_base: {
        actions: {
          read: true
        }
      },

      // Tickets:
      // ---------
      //
      // Access only to tickets management (create and manage).
      // Additional restrictions provided by a custom middleware
      // will prevent from accessing other user's tickets
      tickets: {
        actions: {
          manageTickets: true
        }
      }

    }
  }
];

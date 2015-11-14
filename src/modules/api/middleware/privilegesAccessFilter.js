'use strict';

var
  _      = require('lodash'),
  errors = require('src/lib/errors');


/**
 * AccessFilter Middleware based on the user privileges
 *
 * Middleware to restrict access to some routes based on the user privileges.
 *
 * Each route can define a set of required privileges the user must comply in
 * order to access. That required permissions should be defined like this:
 *
 * ```
 * {
 *   "some_key": true,
 *
 *   "another_key": {
 *     "actions": {
 *       "read": true,
 *       "delete": true
 *     }
 *   },
 *
 *   "yet_another_key": {
 *     "modules": {
 *       "a_nested_key": true
 *     }
 *   }
 * }
 * ```
 *
 * The _keys_ are some identifier, like a module name, the route or whatever.
 * The values should be a boolean or an object.
 * If it's a boolean with a true value, it means it requires global access to
 * that key.
 * An object can also be used for more detailed control. If it is an object, it
 * may contain an `actions` node, that defines the specific required privileges,
 * and/or a `modules` object, that allows creating nested structures.
 *
 * The user (retrieved from `req.user`) should have a `privileges` attribute,
 * and should contain the required privileges.
 *
 * If the resource requires some specific privilege, like:
 *
 * ```
 * {
 *   "foo": {
 *     "actions": { "read": true }
 *   }
 * }
 * ```
 *
 * And the user has:
 *
 * ```
 * {
 *   "foo": true
 * }
 * ```
 *
 * the access will be granted, because the user permission is global.
 *
 * See the tests to see how this exactly works
 * (there are a ton of examples with a lot of possible combinations).
 *
 */
var checkPrivilegesMiddleware = function(requiredPermissions, req, res, next) {

  // if no permissions are required just continue
  if(!requiredPermissions) {
    return next();
  }

  // if any permission defined, the user must be authenticated,
  // and must have some permissions assigned
  if(!req.user || !req.user.privileges) {
    return next(new errors.Unauthorized());
  }

  // compare the required privileges with the user ones
  if(!isAllowed(requiredPermissions, req.user.privileges)) {
    return next(new errors.Unauthorized());
  }

  next();
};


/**
 * Aux. recursive method to compare the required privileges with the user ones
 *
 * @return {Boolean} True if all the required permissions are satisfied, or false
 * @private
 */
var isAllowed = function(requiredPermissions, userPermissions) {
  return _.reduce(requiredPermissions, function(accessGranted, val, key) {

    // if any previous check has returned false, there's no need to keep checking
    if(!accessGranted) {
      return false;
    }

    var
      requestedPermission = val,
      userPermission      = userPermissions[key];

    if(!userPermission) {
      // if the user privileges does not contain the node, deny the access
      return false;

    } else if(_.isBoolean(requestedPermission)) {

      // global (boolean) privilege required
      if(_.isBoolean(userPermission)) {
        // the user privilege is also global, allow access if the values match
        return (requestedPermission && userPermission);

      } else {
        // the required privilege is global, but the user has an specific one, so denied
        return false;
      }

    } else if(_.isBoolean(userPermission)) {
      // specific permission required, but the user has a global (boolean) one
      return userPermission;

    } else {

      // complex scenario: the node has an 'actions' node inside,
      // and/or a nested structure (a 'modules node')
      var
        actions = true,
        modules = true;

      // check actions
      if(requestedPermission.actions) {
        actions = isActionsAllowed(requestedPermission.actions, userPermission.actions);
      }

      // check nested modules
      if(requestedPermission.modules) {
        // recurse
        modules = isAllowed(requestedPermission.modules, userPermission.modules);
      }

      return actions && modules;
    }

  }, true);
};


/**
 * Aux. method to compare permissions on the `actions` nodes
 * @return {Boolean} True if all the required permissions are satisfied, or false
 * @private
 */
var isActionsAllowed = function(requiredActions, userActions) {
  if(!requiredActions || !_.keys(requiredActions).length) {
    return true;
  }

  if(!userActions || !_.keys(userActions).length) {
    return false;
  }

  return _.reduce(requiredActions, function(memo, v, k) {
    if(!memo) {
      return false;
    }

    if(userActions[k]) {
      // the key is present on the both params
      return (v && userActions[k]);
    } else {
      // the key is present only on the first param.
      // if the val is true the requirement is not matched
      // if it's false, it is
      return !v;
    }
  }, true);

};


module.exports = {
  middleware: checkPrivilegesMiddleware,

  // "private" methods, exported to make them testeable
  _isAllowed: isAllowed,
  _isActionsAllowed: isActionsAllowed
};

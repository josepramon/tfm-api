'use strict';

var
  _           = require('lodash'),
  apiBasePath = '../../..',
  config      = require('src/config'),
  errors      = require('src/lib/errors'),
  objectid    = require('mongodb').ObjectID,
  addFilters  = require(apiBasePath +'/middleware/addFilters').middleware,
  getFilters  = require(apiBasePath +'/util/filterParser');


/**
 * Tickets access filter
 *
 * Applies some additional restrictions to the methods
 */
var accessFilter = function(req, res, next) {
  if(!req.user) {
    return next(new errors.Unauthorized());
  }

  // Only the admins can delete tickets
  if(req.method === 'DELETE') {
    if(req.user.role !== config.roles.admin) {
      return next(new errors.Unauthorized());
    }
  }


  // Make sure regular users can only access their own tickets
  if(req.user.role === config.roles.user) {
    return addFilters({user: req.user.id}, true, req, res, next);
  }

  // By default, return only the assigned tickets
  // This can be overrided with a parameter like ?filters=assigned:false
  // In that situation, the manager has also access to the unassigned tickets
  // (from assigned categories)
  if(req.user.role === config.roles.manager) {

    var
      requestedFilters = getFilters(req),
      userObj = req.user.userObj || {},
      assignedCategories = _.isArray(userObj.ticketCategories) ? userObj.ticketCategories : [],
      filters = {};


    if(req.method === 'PUT' || req.method === 'PATCH') {

      // make sure the agent can't edit a ticket assigned to another agent
      // or from an unassigned category
      filters = {
        categories: assignedCategories,
        manager: {$in: [null,req.user.id]}
      };

    } else {

      if(req.params.id) {

        filters = {
          categories: assignedCategories,
          manager: {$in: [null,req.user.id]}
        };

      } else {

        if(!requestedFilters.assigned || (requestedFilters.assigned === 'false')) {
          filters = {categories: assignedCategories, manager: null};
        } else {
          filters = {manager: req.user.id};
        }
      }
    }

    return addFilters(filters, true, req, res, next);

  }

  next();
};


module.exports = accessFilter;

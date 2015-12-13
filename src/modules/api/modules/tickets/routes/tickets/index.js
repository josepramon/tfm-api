'use strict';

var
  _                       = require('lodash'),
  apiBasePath             = '../../../..',

  config                  = require('src/config'),
  Ticket                  = require('../../models/Ticket'),
  filterPrivateAttributes = require(apiBasePath + '/util/filterPrivateAttributes'),

  TicketsController       = require('../../controllers/TicketsController'),
  controller              = new TicketsController();






// tmp, move this to the appropiate dir
var
  // config     = require('src/config'),
  errors     = require('src/lib/errors'),
  objectid   = require('mongodb').ObjectID,
  addFilters = require(apiBasePath +'/middleware/addFilters').middleware,
  getFilters = require(apiBasePath +'/util/filterParser');



/**
 * Output filter middleware
 */
var outputFilter = function(req, res, next) {
  var originalJSONMethod = res.json.bind(res);

  res.json = function(data) {
    if(req.user.role === config.roles.user) {
      data.data = filterPrivateAttributes(Ticket, data.data);
    }
    originalJSONMethod(data);
  };

  next();
};






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


  // Make sure regulat users can only access their own tickets
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







module.exports = function(router) {


  router.use('/tickets/tickets', outputFilter);

  router.route('/tickets/tickets')
    .get(accessFilter, controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:id')
    .get(accessFilter, controller.getOne.bind(controller))
    .put(accessFilter, controller.update.bind(controller))
    .patch(accessFilter, controller.updatePartial.bind(controller))
    .delete(accessFilter, controller.delete.bind(controller));
};

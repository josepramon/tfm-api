'use strict';

var
  _                       = require('lodash'),
  config                  = require('src/config'),

  apiBasePath             = '../../../..',
  moduleBasePath          = '../..',
  PrivilegesMiddleware    = require('src/modules/api/middleware/privilegesAccessFilter').middleware,
  addFilters              = require(apiBasePath +'/middleware/addFilters').middleware,

  TicketsController       = require('../../controllers/TicketsController'),
  controller              = new TicketsController();


/**
 * Access control filter
 */
var
  requiredPermissions = { tickets: { actions: { uncategorised: true } } },
  accessControlFilter = _.partial(PrivilegesMiddleware, requiredPermissions);


/**
 * Filter to limit the access only to tickets without category
 */
var uncategorisedFilter = function(req, res, next) {
  var filters = { category: null };
  return addFilters(filters, false, req, res, next);
};


/**
 * Input filter
 *
 * The purpose of this routes is assign only a new category to uncategorised tickets
 * (the category is required on the tickets, but if a category with assigned tickets
 * is deleted, the tickets become orphans).
 *
 * So filter out any parameter but the category to prevent modifying other ticket attributes.
 */
var inputFilter = function(req, res, next) {
  req.body = _.pick(req.body, 'category');
  next();
};

module.exports = function(router) {


  router.route('/tickets/uncategorised')
    .get(accessControlFilter, uncategorisedFilter, controller.getAll.bind(controller));

  router.route('/tickets/uncategorised/:id')
    .get(accessControlFilter, uncategorisedFilter, controller.getOne.bind(controller))
    .patch(accessControlFilter, inputFilter, uncategorisedFilter, controller.updatePartial.bind(controller));
};

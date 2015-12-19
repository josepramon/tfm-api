'use strict';

var
  _                    = require('lodash'),
  apiBasePath          = '../../../..',
  moduleBasePath       = '../..',
  PrivilegesMiddleware = require('src/modules/api/middleware/privilegesAccessFilter').middleware,
  CategoriesController = require(moduleBasePath + '/controllers/CategoriesController'),
  controller           = new CategoriesController();


/**
 * Access control filter
 */
var
  PrivilegesMiddleware = require(apiBasePath + '/middleware/privilegesAccessFilter').middleware,
  permissions          = { tickets: { actions: { manageCategories: true } } },
  accessControlFilter  = _.partial(PrivilegesMiddleware, permissions);

module.exports = function(router) {

  router.route('/tickets/categories')
    .get(controller.getAll.bind(controller))
    .post(accessControlFilter, controller.create.bind(controller));

  router.route('/tickets/categories/:id')
    .get(controller.getOne.bind(controller))
    .put(accessControlFilter, controller.update.bind(controller))
    .patch(accessControlFilter, controller.updatePartial.bind(controller))
    .delete(accessControlFilter, controller.delete.bind(controller));
};

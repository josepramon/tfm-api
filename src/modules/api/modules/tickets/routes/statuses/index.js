'use strict';

var
  _                    = require('lodash'),
  apiBasePath          = '../../../..',
  moduleBasePath       = '../..',
  StatusesController   = require('../../controllers/StatusesController'),
  controller           = new StatusesController();


/**
 * Access control filter
 */
var
  PrivilegesMiddleware = require(apiBasePath + '/middleware/privilegesAccessFilter').middleware,
  permissions          = { tickets: { actions: { manageStatuses: true } } },
  accessControlFilter  = _.partial(PrivilegesMiddleware, permissions);


module.exports = function(router) {

  router.route('/tickets/statuses')
    .get(controller.getAll.bind(controller))
    .post(accessControlFilter, controller.create.bind(controller));

  router.route('/tickets/statuses/:id')
    .get(controller.getOne.bind(controller))
    .put(accessControlFilter, controller.update.bind(controller))
    .patch(accessControlFilter, controller.updatePartial.bind(controller))
    .delete(accessControlFilter, controller.delete.bind(controller));
};

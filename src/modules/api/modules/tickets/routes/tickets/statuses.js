'use strict';

var
  _                        = require('lodash'),
  apiBasePath              = '../../../..',
  moduleBasePath           = '../..',
  accessControlFilter      = require(moduleBasePath + '/middleware/ticketsNestedEntitiesFilter'),
  TicketStatusesController = require(moduleBasePath + '/controllers/TicketStatusesController'),
  controller               = new TicketStatusesController();



module.exports = function(router) {

  router.route('/tickets/tickets/:ticketId/statuses')
    .get(accessControlFilter, controller.getAll.bind(controller))
    .post(accessControlFilter, controller.create.bind(controller));

  router.route('/tickets/tickets/:ticketId/statuses/:id')
    .get(accessControlFilter, controller.getOne.bind(controller))
    .put(accessControlFilter, controller.update.bind(controller))
    .patch(accessControlFilter, controller.updatePartial.bind(controller))
    .delete(accessControlFilter, controller.delete.bind(controller));
};

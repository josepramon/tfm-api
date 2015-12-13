'use strict';

var
  _                        = require('lodash'),
  TicketStatusesController = require('../../controllers/TicketStatusesController'),
  controller               = new TicketStatusesController();


module.exports = function(router) {

  router.route('/tickets/tickets/:ticketId/statuses')
    .get(controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:ticketId/statuses/:id')
    .get(controller.getOne.bind(controller))
    .put(controller.update.bind(controller))
    .patch(controller.updatePartial.bind(controller))
    .delete(controller.delete.bind(controller));
};

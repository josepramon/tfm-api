'use strict';

var
  _                    = require('lodash'),
  TicketsController    = require('../../controllers/TicketsController'),
  controller           = new TicketsController();



// if user: own
// if manager: assigned | filter: unassigned (en qualsevol cas restringir categories)


module.exports = function(router) {

  router.route('/tickets/tickets')
    .get(controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:id')
    .get(controller.getOne.bind(controller))
    .put(controller.update.bind(controller))
    .patch(controller.updatePartial.bind(controller))
    .delete(controller.delete.bind(controller));
};

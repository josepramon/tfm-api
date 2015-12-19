'use strict';

var
  _                       = require('lodash'),
  config                  = require('src/config'),

  apiBasePath             = '../../../..',
  moduleBasePath          = '../..',

  // middleware to filter out some attributes from the output
  outputFilter            = require(moduleBasePath + '/middleware/outputFilter'),

  // middleware to apply additional access restrictions on the routes
  ticketsAccessFilter     = require(moduleBasePath + '/middleware/ticketsAccessFilter'),

  TicketsController       = require('../../controllers/TicketsController'),
  controller              = new TicketsController();



module.exports = function(router) {

  // filter out some attributes from the response based on the user profile,
  // for example, don't return 'private' info (like managers notes, or tags)
  // to the regular users.
  router.use('/tickets/tickets', outputFilter);

  router.route('/tickets/tickets')
    .get(ticketsAccessFilter, controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:id')
    .get(ticketsAccessFilter, controller.getOne.bind(controller))
    .put(ticketsAccessFilter, controller.update.bind(controller))
    .patch(ticketsAccessFilter, controller.updatePartial.bind(controller))
    .delete(ticketsAccessFilter, controller.delete.bind(controller));
};

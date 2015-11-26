'use strict';

var
  _                    = require('lodash'),
  StatusesController   = require('../../controllers/StatusesController'),
  controller           = new StatusesController();



module.exports = function(router) {

  router.route('/tickets/statuses')
    .get(controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/statuses/:id')
    .get(controller.getOne.bind(controller))
    .put(controller.update.bind(controller))
    .patch(controller.updatePartial.bind(controller))
    .delete(controller.delete.bind(controller));
};

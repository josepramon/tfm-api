'use strict';

var
  _                    = require('lodash'),
  CategoriesController = require('../../controllers/CategoriesController'),
  controller           = new CategoriesController();



module.exports = function(router) {

  router.route('/tickets/categories')
    .get(controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/categories/:id')
    .get(controller.getOne.bind(controller))
    .put(controller.update.bind(controller))
    .patch(controller.updatePartial.bind(controller))
    .delete(controller.delete.bind(controller));
};

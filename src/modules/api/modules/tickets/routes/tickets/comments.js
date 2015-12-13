'use strict';

var
  _                  = require('lodash'),
  CommentsController = require('../../controllers/CommentsController'),
  controller         = new CommentsController();


// check owner or profile
// user can create comments for his own tickets
// agents can comment their assigned tickets
// tickets must be open
//
// agents can update/delete, users don't


module.exports = function(router) {

  router.route('/tickets/tickets/:ticketId/comments')
    .get(controller.getAll.bind(controller))
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:ticketId/comments/:id')
    .get(controller.getOne.bind(controller))
    .put(controller.update.bind(controller))
    .patch(controller.updatePartial.bind(controller))
    .delete(controller.delete.bind(controller));
};

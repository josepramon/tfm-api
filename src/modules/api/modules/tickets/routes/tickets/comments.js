'use strict';

var
  _                    = require('lodash'),
  apiBasePath          = '../../../..',
  moduleBasePath       = '../..',
  addFilters           = require(apiBasePath +'/middleware/addFilters').middleware,
  accessControlFilter  = require(moduleBasePath + '/middleware/ticketsNestedEntitiesFilter'),

  // additional restrictions fro the comments
  ticketCommentFilter  = require(moduleBasePath + '/middleware/ticketCommentFilter'),

  CommentsController   = require('../../controllers/CommentsController'),
  controller           = new CommentsController();


module.exports = function(router) {

  router.route('/tickets/tickets/:ticketId/comments')
    .get(accessControlFilter, controller.getAll.bind(controller))
    .post(accessControlFilter, ticketCommentFilter, controller.create.bind(controller));

  router.route('/tickets/tickets/:ticketId/comments/:id')
    .get(accessControlFilter, controller.getOne.bind(controller))
    .put(accessControlFilter, ticketCommentFilter, controller.update.bind(controller))
    .patch(accessControlFilter, ticketCommentFilter, controller.updatePartial.bind(controller))
    .delete(accessControlFilter, ticketCommentFilter, controller.delete.bind(controller));
};

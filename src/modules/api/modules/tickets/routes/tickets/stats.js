'use strict';

var
  _               = require('lodash'),
  apiBasePath     = '../../../..',
  moduleBasePath  = '../..',
  config          = require('src/config'),
  StatsController = require(moduleBasePath + '/controllers/TicketStatsController'),
  controller      = new StatsController();

// Access restrictions
var
  PrivilegesMiddleware = require(apiBasePath + '/middleware/privilegesAccessFilter').middleware,
  permissions          = { tickets: { actions: { stats: true } } },
  accessControlFilter  = _.partial(PrivilegesMiddleware, permissions);




/**
 * Ticket stats routes
 *
 * The routes might look a bit inconsistent with other modules, but they're not.
 * The only difference is that this module does not expose the PUT/PATCH/DELETE
 * methods. The rest is consistent.
 *
 * `/tickets/stats`          -> returns all the stats (the 'collection')
 * `/tickets/stats/whatever` -> returns some particular stats (the 'model')
 */
module.exports = function(router) {



  router.route('/tickets/stats')
    .get(controller.getAll.bind(controller));




  router.route('/tickets/stats/general').get(accessControlFilter, controller.getGeneral.bind(controller));

  router.route('/tickets/stats/byManager').get(accessControlFilter, controller.getByManager.bind(controller));

  router.route('/tickets/stats/byUser').get(accessControlFilter, controller.getByUser.bind(controller));

  router.route('/tickets/stats/byCategory').get(accessControlFilter, controller.getByCategory.bind(controller));

  router.route('/tickets/stats/byStatus').get(accessControlFilter, controller.getByStatus.bind(controller));

  router.route('/tickets/stats/byDate').get(accessControlFilter, controller.getByDate.bind(controller));
};

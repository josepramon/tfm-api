'use strict';

var loadRoutes = require('src/lib/routeLoader');

module.exports = function(router) {
  loadRoutes(__dirname + '/../modules/knowledge_base/routes/**/*.js', router);
};

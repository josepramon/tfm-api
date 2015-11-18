'use strict';

var loadRoutes = require('src/lib/routeLoader');

module.exports = function(router) {
  loadRoutes(__dirname + '/../modules/uploads/routes/**/*.js', router);
};

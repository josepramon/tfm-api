'use strict';

var
  glob  = require('glob'),
  debug = require('debug')('ApiApp:RouteLoader:' + process.pid);


module.exports = function(routesGlob, router) {
  glob(routesGlob, function (err, files) {
    files.forEach(function(routesFile) {
      var route = routesFile.substr(0, routesFile.lastIndexOf('.'));
      debug('Adding route:' + route);
      require(route)(router);
    });
  });
};

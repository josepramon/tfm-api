'use strict';

var
  fs         = require('fs'),
  glob       = require('glob'),
  express    = require('express'),
  mongoose   = require('mongoose'),
  debug      = require('debug')('ApiApp:API:' + process.pid),
  config     = require('src/config'),
  jwt        = require('express-jwt'),
  jwtAuth    = require('src/lib/jwtAuth'),
  errors     = require('src/lib/errors'),
  routesDir  = __dirname + '/routes/';


// MONGO CONF.
// =============================================================================
var mongoConfigParser = require('src/lib/mongoConfigParser');

var mongoConn = new mongoConfigParser().setEnv({
  host     : config.mongo.default.host,
  port     : config.mongo.default.port,
  user     : config.mongo.default.user,
  password : config.mongo.default.password,
  database : config.mongo.default.database
});

/* istanbul ignore next */
mongoose.connection.on('error', function () {
    debug('Mongoose connection error');
});

/* istanbul ignore next */
mongoose.connection.once('open', function callback() {
    debug('Mongoose connected to the database');
});

// connect
mongoose.connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions());


// SETUP THE MODULE ROUTES
// =============================================================================
var router = express.Router();

// auth free routes
var excluded = {path: [
  /api\/?$/i,
  /api\/auth\/?$/i
]};

// Setup the authentication using JWT
router.use( jwt({ secret: config.jwtSecret }).unless(excluded) );
router.use( jwtAuth.middleware().unless(excluded) );


// -- API ROUTES --

/**
 * @api {get} /api/ API entry point
 * @apiName Index
 * @apiGroup ROOT
 * @apiDescription Test route to make sure everything is working
 *
 * @apiExample Example usage:
 * curl -4 -i http://localhost:9000/api
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "hooray! welcome to our api!"
 *     }
 */
router.get('/', function(req, res, next) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// load the routes
glob(routesDir + '**/*.js', function (er, files) {
  files.forEach(function(routesFile) {
    var route = routesFile.substr(0, routesFile.indexOf('.'));
    debug('Adding route:' + route);
    require(route)(router);
  });
});


module.exports = router;

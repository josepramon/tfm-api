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
  routesDir  = __dirname + '/routes/',
  testEnv    = process.env.TEST;


// MONGO CONF.
// =============================================================================
var mongoConfigParser = require('src/lib/mongoConfigParser');

var db = testEnv ? config.mongo.test : config.mongo.default;

var mongoConn = new mongoConfigParser().setEnv({
  host     : db.host,
  port     : db.port,
  user     : db.user,
  password : db.password,
  database : db.database
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

// Setup the authentication using JWT
// This middleware will be applied to ALL the routes except the ones deffined in
// src/config/publicRoutes. It checks the request headers for the presence of an
// authentication header, and then it validates the user.
// Additional middlewares deffined later can add additional restricions on each
// route, like restricting the access based on the user role or whatever.

// auth free routes
var excluded = {path: config.publicRoutes};

// Setup
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
glob(routesDir + '**/*.js', function (err, files) {
  files.forEach(function(routesFile) {
    var route = routesFile.substr(0, routesFile.lastIndexOf('.'));
    debug('Adding route:' + route);
    require(route)(router);
  });
});


module.exports = router;

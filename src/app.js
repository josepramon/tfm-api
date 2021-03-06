'use strict';

// Set the base path for the requires
// (The conditional path is necessary in order
// to run the tests on the instrumented code)
/* istanbul ignore next */
if(process.env.APP_DIR_FOR_CODE_COVERAGE) {
  require('../../../../config/require');
} else {
  require('../config/require');
}


var
  debug      = require('debug')('ApiApp:' + process.pid),
  fs         = require('fs'),
  errors     = require('src/lib/errors'),

  express    = require('express'),
  bodyParser = require('body-parser'),
  cors       = require('cors'),
  config     = require('./config'),

  port       = config.serverPort || process.env.PORT || 5000;



/**
 * Mailer component initialization
 */
var setupMailer = function() {
  var
    mailConfig = config.mail,
    mailer     = require('src/lib/mailer');

  if(mailConfig && mailConfig.sender) {
    mailer.setDefaults({ from: mailConfig.sender });
    delete mailConfig.sender;
  }

  mailer.setup(mailConfig);
};


/**
 * App setup, wrapped inside a function so it can be called multiple
 * times to create the workers when running in cluster mode
 */
var createApp = function() {

  var app = express();

  // configure the mailer
  setupMailer();


  // BASE SETUP
  // =============================================================================

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // enable CORS
  app.use(cors({ origin: '*' }));
  app.options('*', cors()); //  enable pre-flight across-the-board

  // configure app to use response-time to detect possible bottlenecks or other issues
  app.use(require('response-time')());
  app.use(require('compression')());

  // enable being used behind a proxy
  app.set('trust proxy', 'loopback');


  // SETUP THE PAGINATION MIDDLEWARE
  // =============================================================================
  var paginate = require('express-paginate');

  app.use(paginate.middleware(config.pagination.defaultLimit, config.pagination.maxLimit));


  // Restful API
  // =============================================================================
  var API = require('./modules/api');

  // Register the routes
  // all of our routes will be prefixed with /api
  app.use('/api', API);


  // Static uploads serving
  //
  // If the uploads are enabled, enable static file serving for that files.
  // On production, the files should not be served by the API, it's better
  // to serve directly form Nginx (or Apache or whatever).
  // =============================================================================
  if(config.uploads && config.uploads.mode === 'local' && !config.uploads.host) {
    app.use('/'+config.uploads.path, express.static(config.uploads.dest));
  }


  // ERROR HANDLING
  // =============================================================================

  // throw a 404 error if the route does not match anything
  app.all('*', function (req, res, next) {
      next(new errors.NotFound());
  });

  // generic error handler
  app.use(require('./errorHandlers').middleware);

  // START THE SERVER
  // =============================================================================
  app.listen(port);
  debug('Server running on port ' + port);

  return app;
};


/* istanbul ignore else */
exports.app = createApp();

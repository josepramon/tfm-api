'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),

  apiBasePath     = '../../..',
  moduleBasePath  = '..',

  // API utilities
  Request         = require(apiBasePath + '/util/Request'),
  Response        = require(apiBasePath + '/util/Response'),
  ExpandsURLMap   = require(apiBasePath + '/util/ExpandsURLMap'),
  filters         = require(apiBasePath + '/util/filters'),
  notify          = require(moduleBasePath + '/util/TicketChangesNotifier').notify,

  // Base class
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Ticket           = require(moduleBasePath + '/models/Ticket'),

  // other entities
  Status           = require(moduleBasePath + '/models/Status');


class TicketStatusesController extends BaseController
{
  constructor() {
    super();
    /**
     * @type {Model}
     */
    this.Model = Ticket;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({
      "user": {
        "expands": {
          "profile": {
            "expands": {
              "image": {
                "route": "/uploads/:itemId",
                "expands": {"id":null}
              }
            }
          }
        }
      },
      "status": {}
    });
  }


  /**
   * Retrieve one status
   */
  getOne(req, res, next) {
    var
      that     = this,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      criteria = this._buildCriteria(request);


    Ticket.findOne(criteria).exec(function(err, model) {
      /* istanbul ignore next */
      if (err)    { return next(err); }
      if (!model) { return next(new errors.NotFound()); }

      var status = model.statuses.id(request.req.params.id);

      if(!status) { return next(new errors.NotFound()); }

      that._populateStatuses(model, request, function(err, populated) {
        if(err) { return next(err); }

        response.formatOutput(status, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Retrieve all the ticket statuses
   */
  getAll(req, res, next) {
    var
      that     = this,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      criteria = this._buildCriteria(request);


    Ticket.findOne(criteria).exec(function(err, model) {
      /* istanbul ignore next */
      if (err)    { return next(err); }
      if (!model) { return next(new errors.NotFound()); }

      that._populateStatuses(model, request, function(err, populated) {
        if(err) { return next(err); }

        response.formatOutput(model.statuses, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Create a status
   */
  create(req, res, next) {
    var
      that     = this,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.user, req.body);

    async.waterfall([
      function setup(callback) {
        Ticket.findOne(criteria).exec(function(err, model) {
          /* istanbul ignore next */
          if (err)    { return callback(err); }
          if (!model) { return callback(new errors.NotFound()); }

          callback(null, model, waterfallOptions);
        });
      },
      this._createStatus,
      this._addStatus,
      this._saveTicket

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }


      that._populateStatuses(model, request, function(err, populated) {
        if(err) { return next(err); }

        var status = _.last(populated.statuses);


        that._notifyUsers(req.user, model, status, function(err) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          response.formatOutput(status, function(err, output) {
            /* istanbul ignore next */
            if (err) { return next(err); }

            res.json(output);
          });
        });
      });
    });
  }


  /**
   * Edit a status
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      that     = this,
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.user, req.body);

    async.waterfall([
      function setup(callback) {
        Ticket.findOne(criteria).exec(function(err, model) {
          /* istanbul ignore next */
          if (err)    { return callback(err); }
          if (!model) { return callback(new errors.NotFound()); }

          var status = model.statuses.id(request.req.params.id);
          if(!status) { return next(new errors.NotFound()); }

          if(!_.isUndefined(waterfallOptions.comments)) {
            status.comments = waterfallOptions.comments;
          } else {
            if(!patch) {
              status.comments = '';
            }
          }

          // save the reference to the ticket
          waterfallOptions.ticketModel = model;

          callback(null, status, waterfallOptions);
        });
      },
      this._saveTicket

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }


      that._populateStatuses(model, request, function(err, populated) {
        if(err) { return next(err); }

        var status = _.last(populated.statuses);

        that._notifyUsers(req.user, model, status, function(err) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          response.formatOutput(status, function(err, output) {
            /* istanbul ignore next */
            if (err) { return next(err); }

            res.json(output);
          });
        });
      });
    });
  }


  /**
   * Edit a status (patch)
   */
  updatePartial(req, res, next) {
    this.update(req, res, next, true);
  }


  /**
   * Delete a status
   */
  delete(req, res, next) {
    //post.comments.id(my_id).remove();
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),
      criteria = this._buildCriteria(request);


    Ticket.findOne(criteria).exec(function(err, model) {
      /* istanbul ignore next */
      if (err)    { return next(err); }
      if (!model) { return next(new errors.NotFound()); }

      var status = model.statuses.id(request.req.params.id);

      if(!status) { return next(new errors.NotFound()); }

      status.remove();

      model.save(function(err, model) {
        if (err) { return next(err); }

        response.formatOutput(status, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }




  // Aux. "private" methods
  // =============================================================================

  /**
   * Query builder for mongoose
   */
  _buildCriteria(request) {
    var criteria = {};

    if(request.req.params.ticketId) {
      criteria._id = request.req.params.ticketId;
    }

    if(request.filters) {
      _.extend(criteria, this._parseFilters(request));
    }

    return criteria;
  }


  _buildWaterfallOptions(user, data){
    var
      options = { user: user },
      fields  = ['comments', 'status'];

    fields.forEach(function(field) {
      if(!_.isUndefined(data[field])) {
        options[field] = data[field];
      }
    });

    return options;
  }


  /**
   * Create a status
   */
  _createStatus(ticket, options, callback) {

    // save the reference to the ticket
    options.ticketModel = ticket;

    // create the comment
    var status = _.pick(options, 'comments');

    // assign the user
    status.user = options.user.id;

    // add the status
    var statusObj = options.status;
    if(!_.isObject(statusObj)) {
      try {
        statusObj = JSON.parse(statusObj);
      } catch(e) {
        return callback( errors.Validation(ticket, 'status', 'Status must be a valid JSON') );
      }
    }
    status.status = statusObj.id;

    callback(null, status, options);
  }


  /**
   * Attach a status to a ticket
   */
  _addStatus(status, options, callback) {
    var ticketModel = options.ticketModel;

    ticketModel.statuses.push(status);

    callback(null, status, options);
  }


  /**
   * Save the parent model
   */
  _saveTicket(status, options, callback) {
    var ticketModel = options.ticketModel;

    // set an additional field to the ticket
    // to make the filtering more simple
    Status.findOne({'_id': status.status}).exec(function(err, statusModel) {
      /* istanbul ignore next */
      if (err)          { return callback(err); }
      if (!statusModel) { return callback(new errors.NotFound()); }

      ticketModel.set({'closed': statusModel.closed});

      ticketModel.save(function(err, model) {
        /* istanbul ignore next */
        if (err) { return callback(err); }
        callback(null, model, options);
      });
    });
  }


  /**
   * Statuses population
   *
   * The statuses are being populated here and not in the response (like on other models)
   * because the statuses are not regular models, instead they are EmbeddedDocuments,
   * so the generic method is not adequate.
   */
  _populateStatuses(model, request, callback) {
    var expands = {};
    _.each(request.getExpands(100), function(v,k) {
      expands['statuses.'+k] = v;
    });

    var
      paths = _.keys(expands).join(' '),
      populationOpts = { populate: expands };

    Ticket.deepPopulate(model, paths, populationOpts, function(err, populated) {
      callback(err, populated);
    });

  }


  /**
   * Send a mail notification to the appropiate users
   */
  _notifyUsers(user, model, status, callback) {

    var mailSettings = {
      template:     'mail_ticketNewStatus',
      templateData: {
        statusName: status.status.name
      }
    };

    notify(user, model, mailSettings, callback);
  }

}


module.exports = TicketStatusesController;

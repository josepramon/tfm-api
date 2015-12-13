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
  attachmentsUtil = require(apiBasePath + '/modules/uploads/util/attachmentsUtil'),

  // Base class
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  // (not exactly the model, just the nested comments)
  Ticket           = require(moduleBasePath + '/models/Ticket');



class CommentsController extends BaseController
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
      "attachments": {
        "expands": {
          "upload": {
            "route": "/uploads/:itemId"
          }
        }
      },
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
      }
    });
  }


  /**
   * Retrieve one comment
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

      var comment = model.comments.id(request.req.params.id);

      if(!comment) { return next(new errors.NotFound()); }

      that._populateComments(model, request, function(err, populated) {
        if(err) { return next(err); }

        response.formatOutput(comment, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Retrieve all the ticket comments
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


      that._populateComments(model, request, function(err, populated) {
        if(err) { return next(err); }

        response.formatOutput(model.comments, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Create a comment
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
      this._createComment,
      attachmentsUtil.setAttachments,
      this._addComment,
      this._saveTicket

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }


      that._populateComments(model, request, function(err, populated) {
        if(err) { return next(err); }

        var comment = _.last(populated.comments);

        response.formatOutput(comment, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Edit a comment
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

          var comment = model.comments.id(request.req.params.id);
          if(!comment) { return next(new errors.NotFound()); }

          if(!_.isUndefined(waterfallOptions.comment)) {
            comment.comment = waterfallOptions.comment;
          } else {
            if(!patch) {
              comment.comment = '';
            }
          }

          // save the reference to the ticket
          waterfallOptions.ticketModel = model;

          callback(null, comment, waterfallOptions);
        });
      },
      attachmentsUtil.setAttachments,
      this._saveTicket

    ], function asyncComplete(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }


      that._populateComments(model, request, function(err, populated) {
        if(err) { return next(err); }

        var comment = _.last(populated.comments);

        response.formatOutput(comment, function(err, output) {
          /* istanbul ignore next */
          if (err) { return next(err); }

          res.json(output);
        });
      });
    });
  }


  /**
   * Edit a comment (patch)
   */
  updatePartial(req, res, next) {
    this.update(req, res, next, true);
  }


  /**
   * Delete a comment
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

      var comment = model.comments.id(request.req.params.id);

      if(!comment) { return next(new errors.NotFound()); }

      comment.remove();

      model.save(function(err, model) {
        if (err) { return next(err); }

        response.formatOutput(comment, function(err, output) {
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
      fields  = ['comment', 'user', 'attachments', 'private'];

    fields.forEach(function(field) {
      if(!_.isUndefined(data[field])) {
        options[field] = data[field];
      }
    });

    return options;
  }


  /**
   * Create a comment
   */
  _createComment(ticket, options, callback) {

    // save the reference to the ticket
    options.ticketModel = ticket;

    // create the comment
    var comment = _.pick(options, 'comment', 'private');

    // assign the user
    comment.user = options.user.id;

    callback(null, comment, options);
  }


  /**
   * Attach a comment to a ticket
   */
  _addComment(comment, options, callback) {
    var ticketModel = options.ticketModel;

    ticketModel.comments.push(comment);

    callback(null, comment, options);
  }


  /**
   * Save the parent model
   */
  _saveTicket(comment, options, callback) {
    var ticketModel = options.ticketModel;
    ticketModel.save(function(err, model) {
      /* istanbul ignore next */
      if (err) { return callback(err); }
      callback(null, model, options);
    });
  }


  /**
   * Comments population
   *
   * The comments are being populated here and not in the response (like on other models)
   * because the comments are not regular models, instead they are EmbeddedDocuments,
   * so the generic method is not adequate.
   */
  _populateComments(model, request, callback) {
    var expands = {};
    _.each(request.getExpands(100), function(v,k) {
      expands['comments.'+k] = v;
    });

    var
      paths = _.keys(expands).join(' '),
      populationOpts = { populate: expands };

    Ticket.deepPopulate(model, paths, populationOpts, function(err, populated) {
      callback(err, populated);
    });

  }

}


module.exports = CommentsController;

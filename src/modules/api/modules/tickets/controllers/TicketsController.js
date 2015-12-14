'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),
  objectid        = require('mongodb').ObjectID,

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

  // utilities to manage the bidirectional relations
  TagsUtil        = require(moduleBasePath + '/util/TagsUtil'),

  // Model managed by this controller
  Ticket = require(moduleBasePath + '/models/Ticket'),

  // other related entities
  Status = require(moduleBasePath + '/models/Status');



class TicketsController extends BaseController
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
     * In this particular controller it's very large and somewhat bizarre,
     * but the ticket model contains a lot of nested entities, so it's necessary
     * in order to keep it consistent with the general API structure
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
      "comments": {
        "route": "/tickets/tickets/:parentId/comments",
        "expands": {
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
          "attachments": {
            "expands": {
              "upload": {
                "route": "/uploads/:itemId"
              }
            }
          }
        }
      },
      "manager": {
        "expands": {
          "profile": {
            "route": null,
            "expands": {
              "image": {
                "route": "/uploads/:itemId",
                "expands": {"id":null}
              }
            }
          }
        }
      },
      "statuses": {
        "route": "/tickets/tickets/:parentId/statuses",
        "expands": {
          "status": {"id":null},
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
        }
      }
    });
  }


  /**
   * Create a new Ticket
   */
  create(req, res, next) {

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body, req.user),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);

    async.waterfall([
      function setup(callback) {
        var model = new Ticket(newAttrs);

        // assign the user
        model.set({'user': waterfallOptions.user.id});

        callback(null, model, waterfallOptions);
      },
      attachmentsUtil.setAttachments,
      this._setCategory,
      this._setDefaultStatus,
      this._validate,
      this._save

    ], function asyncComplete(err, model) {

      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }



  /**
   * Update a Ticket
   */
  update(req, res, next) {
    var patch = arguments.length > 3 && arguments[3] === true;

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // query used to find the doc
      criteria = this._buildCriteria(request),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body, req.user),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request, patch);

    async.waterfall([
      function setup(callback) {
        Ticket.findOne(criteria).exec(function(err, ticketModel) {
          /* istanbul ignore next */
          if (err)           { return callback(err); }
          /* istanbul ignore next */
          if (!ticketModel) { return callback(new errors.NotFound()); }

          // assign the new attributes
          ticketModel.set(newAttrs);

          callback(null, ticketModel, waterfallOptions);
        });
      },
      attachmentsUtil.setAttachments,
      this._setCategory,
      this._setTags,
      this._setManager,
      this._setStatus,
      this._validate,
      this._save

    ], function asyncComplete(err, model) {

      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }



  // Aux. "private" methods
  // =============================================================================

  /**
   * Filters parsing for the querys
   */
  _parseFilters(request) {
    var
      // retrieve the filters from the querystring for the 'safe' attributes
      safeAttrsFilters = filters.getSafeAttributesFilters(request.filters, this.Model),

      // retrieve the search
      searchFilters = filters.getSearchFilters(request.filters, request),

      // other filters
      additionalFilters = {};

    // parse the extra filters (might come from the request or some middleware)
    ['user', 'manager'].forEach(function(f) {
      if(_.has(request.filters, f)) {
        additionalFilters[f] = request.filters[f];
      }
    });

    // closed filter
    // tickets are open unless they have the `closed attribute with a ture value
    if(_.has(request.filters, 'closed')) {
      var closedVal = request.filters.closed ? true : {$ne:true};
      additionalFilters.closed = closedVal;
    }

    // add the category restriction
    if(_.has(request.filters, 'categories')) {
      additionalFilters.category = {$in: request.filters.categories};
    }

    return _.extend({}, safeAttrsFilters, searchFilters, additionalFilters);
  }


  _buildWaterfallOptions(data, user){
    var
      options = { user: user },
      fields  = ['category', 'tags', 'comments', 'status', 'manager', 'attachments'];

    fields.forEach(function(field) {
      if(!_.isUndefined(data[field])) {
        options[field] = data[field];
      }
    });

    return options;
  }


  _setManager(model, options, callback) {

    if(!_.isUndefined(options.manager)) {
      let manager = null;

      if(_.isObject(options.manager)) {
        if(options.manager.id) {
          manager = objectid(options.manager.id);
        }
      } else {
        manager = objectid(options.manager);
      }

      model.set({manager: manager});
    }
    callback(null, model, options);
  }


  _setCategory(model, options, callback) {
    if(!_.isUndefined(options.category)) {
      let category = null;

      if(_.isObject(options.category)) {
        if(options.category.id) {
          category = objectid(options.category.id);
        }
      } else {
        category = objectid(options.category);
      }

      model.set({category: category});
    }
    callback(null, model, options);
  }


  _setTags(model, options, callback) {

    // TODO: this method is identical to the one on the ArticlesController
    // so it should be extracted or something

    if(_.isUndefined(options.tags)) {
      callback(null, model, options);
    } else {

      let tags = options.tags;

      if(!_.isObject(tags)) {
        try {
          tags = JSON.parse(tags);
        } catch(e) {
          return callback( errors.Validation(model, 'tags', 'Tags must be a valid JSON') );
        }
      }

      TagsUtil.setTags(model, tags, function(err) {
        /* istanbul ignore next */
        if (err) {
          if(err.code === 11000) {
            var repeatedTag = /:\ "(.+)" \}$/.exec(err.message)[1];
            err = errors.Validation(model, 'tags', "Can't create tag '" + repeatedTag + "', already exists");
          }

          return callback(err);
        }
        callback(null, model, options);
      });
    }

  }


  _setStatus(model, options, callback) {
    if(_.isUndefined(options.status)) {
      callback(null, model, options);
    } else {
      var statusObj = options.status;

      if(statusObj) {
        if(!_.isObject(statusObj)) {
          try {
            statusObj = JSON.parse(options.status);
          } catch(e) {
            return callback( errors.Validation(model, 'status', 'Status must be a valid JSON') );
          }
        }

        var status = {
          user:   options.user.id,
          status: _.isObject(statusObj.status) ? statusObj.status.id : null
        };

        if(!_.isUndefined(statusObj.comments)) {
          status.comments = statusObj.comments;
        }

        model.statuses = model.statuses || [];
        model.statuses.push(status);
      }

      callback(null, model, options);
    }
  }

  /**
   * Set the default (open) status to a ticket
   */
  _setDefaultStatus(model, options, callback) {
    Status.findOne({'open': true}).exec(function(err, statusModel) {
      if (err) { return callback(err); }

      if(statusModel) {
        model.statuses = model.statuses || {};

        model.statuses.push({
          status: statusModel.id,
          user:   model.user
        });
      }
      callback(null, model, options);
    });
  }

}


module.exports = TicketsController;

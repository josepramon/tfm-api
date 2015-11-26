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

  // utilities to manage the bidirectional relations
  // CategoryUtil    = require(moduleBasePath + '/util/CategoryUtil'),
  // TagsUtil        = require(moduleBasePath + '/util/TagsUtil'),

  // Base class
  BaseController  = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Ticket = require(moduleBasePath + '/models/Ticket');



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
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap({});
  }


  /**
   * Create a new Ticket
   */
  create(req, res, next) {

    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap),

      // options for the waterfall functs.
      waterfallOptions = this._buildWaterfallOptions(req.body),

      // mass assignable attrs.
      newAttrs = this._getAssignableAttributes(request);


    async.waterfall([
      function setup(callback) {
        var model = new Ticket(newAttrs);

        // assign the user
        var user = req.user;
        model.set({'user': user.id});

        callback(null, model, waterfallOptions);
      },
      attachmentsUtil.setAttachments,
      this._setCategory,
      this._setTags,
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

  /*
  notes:       [NoteSchema],
  comments:    [CommentSchema],
  attachments: [AttachmentSchema],
  statuses:    [StatusSchema],

  tags:        [{ type: Schema.ObjectId, ref: 'TicketsTag' }],
  category:    { type: Schema.ObjectId, ref: 'TicketsCategory' },
  */


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
      waterfallOptions = this._buildWaterfallOptions(req.body),

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

          /* istanbul ignore next */
          if(req.body.author_id || !patch) {
            ticketModel.set({author: req.body.author_id});
          }

          // if doing a full update, make sure the values are reset if there's no data
          if(!patch) {
            if(!req.body.slug) {
              ticketModel.set({slug: undefined});
            }

            /* istanbul ignore next */
            if(!req.body.tags) { waterfallOptions.tags = []; }

            /* istanbul ignore next */
            if(!req.body.category) { waterfallOptions.category = null; }
          }

          callback(null, ticketModel, waterfallOptions);
        });
      },
      attachmentsUtil.setAttachments,
      this._setCategory,
      this._setTags,
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





  _buildWaterfallOptions(){
    return {};
  }

  _setTags(model, options, callback) {
    callback(null, model, options);
  }

  _setCategory(model, options, callback) {
    callback(null, model, options);
  }

  _setStatuses(model, options, callback) {
    callback(null, model, options);
  }

  _setManager(model, options, callback) {
    callback(null, model, options);
  }

}


module.exports = TicketsController;

'use strict';

var
  // generic stuff
  _                 = require('underscore'),
  errors            = require('src/lib/errors'),

  apiBasePath       = '../../..',
  moduleBasePath    = '..',

  // API utilities
  Request           = require(apiBasePath + '/util/Request'),
  Response          = require(apiBasePath + '/util/Response'),
  ExpandsURLMap     = require(apiBasePath + '/util/ExpandsURLMap'),
  parseResponseFile = require(moduleBasePath + '/util/uploader/responseFileParser'),

  // Base class
  BaseController    = require(apiBasePath + '/controllers/BaseController'),

  // Model managed by this controller
  Upload            = require(moduleBasePath + '/models/Upload');



class UploadsController extends BaseController
{
  constructor() {
    super();

    /**
     * @type {Model}
     */
    this.Model = Upload;

    /**
     * Nested references output config
     *
     * @type {ExpandsURLMap}
     */
    this.expandsURLMap = new ExpandsURLMap();
  }


  /**
   * Create a new upload
   */
  create(req, res, next) {
    if(!req.file) {
      return next(new errors.BadRequest('File is required'));
    }

    var uploadModel = new Upload();
    this._handleUpload(uploadModel, req, res, next);
  }


  /**
   * Update an existing upload
   *
   * Removes the old file, uploads the new one and updates the mongo doc
   * (the new one will have a diferent url)
   */
  update(req, res, next) {
    if(!req.file) {
      return next(new errors.BadRequest('File is required'));
    }

    var
      self    = this,
      request = new Request(req),

      // query used to find the doc
      criteria = this._buildCriteria(request);

    Upload.findOne(criteria).exec(function(err, uploadModel) {
      /* istanbul ignore next */
      if (err) { return next(err); }
      /* istanbul ignore next */
      if (!uploadModel) { return next(new errors.NotFound()); }

      // delete the old file
      uploadModel.deleteFile(function(err) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        self._handleUpload(uploadModel, req, res, next);
      });
    });
  }



  // Aux. "private" methods
  // =============================================================================

  _handleUpload(uploadModel, req, res, next) {
    var
      request  = new Request(req),
      response = new Response(request, this.expandsURLMap);

    // update the model attributes with the file data
    // (this is set by the multer middleware)
    uploadModel.set( parseResponseFile(req) );

    // set the owner
    if(req.user.id) {
      uploadModel.set({owner: req.user.id});
    }

    uploadModel.save(function(err, model) {
      /* istanbul ignore next */
      if (err) { return next(err); }

      response.formatOutput(model, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }

        res.json(output);
      });
    });
  }

}

// request.getOwnerFromAuth

module.exports = UploadsController;

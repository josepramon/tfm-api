'use strict';

var
  _            = require('underscore'),
  ResponseMeta = require('./ResponseMeta'),
  ResponseData = require('./ResponseData');

/**
 * Response utility
 *
 * Formats the API output consistently, and also expands any
 * nested relations (to any level, limited by the controller)
 * if reuested on the querystring.
 */
class Response {

  /**
   * @param {Request} request
   * @param {ExpandsURLMap} expandsURLMap  Options for the expands (url mappings, etc)
   */
  constructor(request, expandsURLMap) {
    this.request          = request || {};
    this.expandsURLMap    = expandsURLMap;
    this.paginationParams = null;
  }


  /**
   * Sets the 'pageCount' and 'itemCount' pagination params returned by some query
   *
   * @param {Number} pageCount
   * @param {Number} itemCount
   * @return {Response} It returns itself so the call can be chained
   */
  setPaginationParams(pageCount, itemCount) {
    this.paginationParams = {
      pageCount: pageCount,
      itemCount: itemCount
    };

    // make the method chainable
    return this;
  }


  /**
   * Output formatter
   *
   * Builds the output with the data to output wrapped inside a 'data' node,
   * and another 'meta' node with info like the entity url, pagination info, etc.
   *
   * @param {mixed} data        Object or array of objects to return from the database
   * @param {Function} callback Callback funct., receives two parameters, the first
   *                            one is an Error object, if something goes wrong,
   *                            and the second one is the formatted output, as an
   *                            object, ready to pass it to res.json
   */
  formatOutput(data, callback) {

    var
      metaNode, dataNode,
      pagination, expands;


    // create the meta formatter
    pagination = this.paginationParams ?
      _.extend(this.request.options, this.paginationParams) : null;

    // set the url for the meta node
    var metaUrl = (this.request.req && this.request.req.method === 'POST' && data._id) ?
      this.request.requestURL + '/' + data._id :
      this.request.requestURL;

    metaNode = new ResponseMeta(metaUrl, pagination);

    // create the data formatter
    expands = this.expandsURLMap ? this.request.getExpands(this.expandsURLMap.depth-1): [];

    dataNode = new ResponseData(this.request.requestBaseURL, expands, this.expandsURLMap);

    // callback executed after populating the nested relations
    // or right away if there's nothing to populate
    var cb = function(data) {
      callback(null, {
        meta: metaNode.toJSON(),
        data: dataNode.setData(data).toJSON()
      });
    };

    // apply the expands and build the output
    if(_.keys(expands).length) {
      this._expandData(data, expands, function(err, expandedData) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        cb(expandedData);
      });
    } else {
      cb(data);
    }
  }


  /**
   * Populate the nested relations.
   *
   * This is done here, at the end, before the response because Mongoose does not
   * support nested expands, so its better to do it here to avoid repeating the
   * code inside each controllers methods.
   *
   * A 'pre' query hook should be better, but a too tricky to implement.
   */
  _expandData(data, expands, callback) {
    // create a deep copy of expands because
    // calling model.deepPopulate alters the original object
    expands = JSON.parse(JSON.stringify(expands));

    var
      model = Array.isArray(data) ? (data.length ? data[0].constructor : null) : data.constructor,
      paths = _.keys(expands).join(' '),
      populationOpts = { populate: expands };

    if(model && paths) {
      model.deepPopulate(data, paths, populationOpts, callback);
    } else {
      callback(null, data);
    }
  }

}


module.exports = Response;

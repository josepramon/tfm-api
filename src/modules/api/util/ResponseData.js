'use strict';

var
  _            = require('underscore'),
  ResponseMeta = require('./ResponseMeta');

/**
 * Response 'data' node formatter
 *
 * It basically transforms the models nested relations into objects
 * with 'meta' and 'data' attributes, where the 'data' node just contains
 * the data, potentially truncated, and the 'meta' node contains some metadata,
 * like the nested objects amount or the url of the API endpoint to get/edit that
 * nested objects.
 */
class ResponseData {

  /**
   * @param {String} baseURL              Base URL (the API url)
   * @param {Array} expands               Nested relations to expand
   * @param {ExpandsURLMap} expandsURLMap Options for the expands (url mappings, etc)
   */
  constructor(baseURL, expands, expandsURLMap) {
    this.baseURL       = baseURL;
    this.expands       = expands;
    this.expandsURLMap = expandsURLMap || {};
    this.data          = null;
  }


  /**
   * @param  {mixed} data   Object or array of objects to return from the database
   * @return {ResponseData} It returns itself so the call can be chained
   */
  setData(data) {
    this.data = data;

    // make the method chainable
    return this;
  }


  /**
   * @return {Object} the formatted 'data' node
   */
  toJSON() {
    var formatedData = {};

    if(this.data) {
      if(Array.isArray(this.data)) {
        let that = this;
        formatedData = [];

        this.data.forEach(function(item) {
          formatedData.push(that._formatItem(item, that.expands, 0));
        });
      } else if(this.data.getRefs) {
        formatedData = this._formatItem(this.data, this.expands, 0);
      } else {
        formatedData = this.data;
      }
    }

    return formatedData;
  }


  // Aux. private methods
  // --------------------------------------------------------------------

  /**
   * Formats one entity by expanding/collapsing the relations as requested
   * with the corresponding meta/data nodes for the relations
   *
   * @param  {Model} item     The entity to format
   * @param  {Array} expands  Relations to expand
   * @param  {Array} stack    Current nesting level
   * @return {Object}         The formatted entity
   */
  _formatItem(item, expands, stack) {
    stack = stack || [];

    if(!item) { return {}; }

    var
      // model refs
      expandable = (item.getRefs) ? item.getRefs() : [],

      // model attributes that will be expanded
      willExpand = _.pick(item, _.keys(expands).map(function(exp) {
        return exp.replace((stack.join('.')+'.'),'');
      })),

      // model attributes that will remain unexpanded
      willNotExpand = _.pick(item,
        _.difference(expandable, _.keys(willExpand))
      ),

      // pick the 'regular' fields (non refs)
      ret = _.omit(item.toJSON(), expandable);

    // add the unexpanded nested data
    for(let attr in willNotExpand) {
      let newStack = stack.concat([attr]);
      ret[attr] = {
        meta: this._getNestedMeta(item, newStack)
      };
    }

    // add the expanded nested data
    for(let attr in willExpand) {
      let newStack = stack.concat([attr]);
      ret[attr] = {
        meta: this._getNestedMeta(item, newStack, expands),
        data: this._formatNestedData(willExpand[attr], this._getNestedExpands(attr, expands), newStack)
      };
    }

    return ret;
  }


  /**
   * Formats one of the entity relations
   *
   * @param  {mixed} nestedData     The nested data (can be a model or an array of them)
   * @param  {Array} nestedExpands  Expands for that level
   * @param  {Array} stack          Current nesting level
   * @return {mixed}                The formatted relations (can be an object or an array of them)
   */
  _formatNestedData(nestedData, nestedExpands, stack) {
    var ret;

    if(Array.isArray(nestedData)) {
      let that = this;
      ret = nestedData.map(function(nestedItem) {
        return that._formatItem(nestedItem, nestedExpands, stack);
      });
    } else {
      ret = this._formatItem(nestedData, nestedExpands, stack);
    }

    return ret;
  }


  /**
   * Formats the meta node for a nested relation
   *
   * @param  {mixed}    data     The data
   * @param  {Array}    stack    Current nesting level
   * @param  {Object}   expands  Expansions
   * @return {Object}            The relation 'meta' node
   */
  _getNestedMeta(data, stack, expands) {
    var
      attr = _.last(stack),
      node = data[attr];

    // get the url
    var
      route = this.expandsURLMap.getRoute(stack.join('/')),
      url   = this._getNestedMetaUrl(data, node, route);

    // get the pagination
    var
      elems      = data.populated(attr) || data[attr],
      totalElems = elems && elems.length ? elems.length : 0;

    var
      paginationOpts = this._getNestedMetaPaginationOptions(expands, attr, totalElems),
      otherParams    = {};

    if(!paginationOpts) {
      otherParams.count = totalElems;
    }

    // return the meta node
    return (new ResponseMeta(url, paginationOpts, otherParams)).toJSON();
  }


  /**
   * @param  {Object} parent     The parent node
   * @param  {Object} node       The nested node (the relation being expanded)
   * @param  {String} nodeRoute  The relation route, from the expandsMap
   * @return {String}            The url for the nested entities
   */
  _getNestedMetaUrl(parent, node, nodeRoute) {
    var url = '';

    if(nodeRoute) {
      url = this.baseURL + nodeRoute;

      // aux internal method
      let getId = function(obj) {
        var ret;
        if(obj) {
          if(obj._id) {
            ret = obj._id;
          } else if('toHexString' in obj) {
            ret = obj;
          } else {
            ret  = null;
          }
        } else {
          ret  = null;
        }
        return ret;
      };

      // replace any item ids placeholders with the obj. ids
      if(url.indexOf(':parentId') > -1) {
        let parentId = getId(parent) || '';
        url = parentId ? url.replace(/:parentId/g, parentId) : '';
      }

      if(url.indexOf(':itemId') > -1) {
        let itemId = getId(node) || '';
        url = itemId ? url.replace(/:itemId/g, itemId): '';
      }
    }

    return url;
  }


  /**
   * @param  {Object} expands        Expands config
   * @param  {String} attr           Attribute name of the expansion
   * @param  {Number} totalElements  Total elements for that attribute
   * @return {Object}                The pagination options for some nested attribute
   */
  _getNestedMetaPaginationOptions(expands, attr, totalElements) {
    var paginationOpts = null;

    if(expands && expands[attr] && expands[attr].options) {
      let opts = expands[attr].options;
      paginationOpts = {
        itemCount: totalElements,
        pageCount: Math.ceil(totalElements/opts.limit),
        limit:     opts.limit,
        page:      opts.skip / opts.limit + 1
      };
      if(opts.sort) {
        paginationOpts.sortBy = opts.sort;
      }
    }

    return paginationOpts;
  }


  /**
   * @param  {String} attr     Entity attribute that contains the nested data
   * @param  {Object}  expands Expands object
   * @return {Array}           The attributes to expand on that attr. (false if none)
   */
  _getNestedExpands(attr, expands) {
    var attrs = _.compact(_.keys(expands).map(function(expand) {
      var expandParts = expand.split('.');
      if(expandParts.length > 1 && expandParts[0] === attr) {
        return expandParts.join('.');
      } else {
        return false;
      }
    }));

    return _.pick(expands, attrs);
  }

}


module.exports = ResponseData;

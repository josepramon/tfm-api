'use strict';

var _ = require('underscore');

/**
 * Nested references output config
 *
 * Determines the maximum depth of the expands (populate operations)
 * and the nested objects URLs.
 *
 * Each controller should have one of this, so the atribute mappings
 * can be customised (for expample, one model with an 'author' attribute can map
 * the expand url to '/api/author' in some controller, but point to
 * '/api/user' on another).
 */
class ExpandsURLMap {

  /**
   * @param {Object} data  an object with the model attributes to expand.
   *                       something like:
   *                       {
   *                         "someAttrToExpand": {
   *                           "route": "/whatever/:parentId/someAttrToExpand"
   *                         },
   *                         "anotherAttrToExpand": {
   *                           "route": "/whatever/:parentId/anotherAttrToExpand",
   *                           "expands": {
   *                             "aNestedExpand": {
   *                               "route": "/foobar/:itemId" // :itemId for 1toN or 1to1 relations
   *                             }
   *                           }
   *                         },
   *                       }
   */
  constructor(data) {
    this.data = data || {};
  }


  /**
   * @return {Number} the expands depth
   */
  get depth() {
    return this._getExpandsMaxDepth(this.data);
  }


  /**
   * Route getter
   * @param  {String} path  Attribute name. For nested attributes, supply a path like 'parent/child'
   * @return {String}       the route for the requested path
   */
  getRoute(path) {
    if(!path) { return null; }

    var
      node  = null,
      attrs = path.split('/');

    let that = this;

    attrs.slice(0, this.depth).forEach(function(k,i) {
      node = (i>0) ? node.expands[k] : that.data[k];
    });

    return node ? node.route : null;
  }


  /**
   * Recursive method to obtain the maximum expands depth from the supplied data
   * @private
   *
   * @param {Object} expandsConfig
   * @param {Number} level
   * @return {Number}
   */
  _getExpandsMaxDepth(expandsConfig, level) {
    level = level || 1;

    for(let key in expandsConfig){
      /* istanbul ignore next */
      if (!expandsConfig.hasOwnProperty(key)) { continue; }

      if(typeof expandsConfig[key] === 'object'){
        if(key === 'expands' && !_.isEmpty(expandsConfig[key])) { level++; }
        level = this._getExpandsMaxDepth(expandsConfig[key], level);
      }
    }
    return level;
  }
}


module.exports = ExpandsURLMap;

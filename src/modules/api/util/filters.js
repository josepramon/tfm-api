var
  _          = require('underscore'),
  stringUtil = require('./string');


/**
 * Generic filters
 * @type {Object}
 */
module.exports = {

  /**
   * Filtering based on model safe attributes
   */
  getSafeAttributesFilters: function(filters, Model) {
    var
      safeAttrs       = Model.safeAttrs || [],
      acceptedFilters = _.pick(filters, safeAttrs);

    var ret = _.reduce(acceptedFilters, function(memo, v, k) {
      if(v) {
        memo[k] = { $regex: v };
      }
      return memo;
    }, {});

    return ret;
  },


  /**
   * Filter based on string searching over multiple model attributes
   * (using a 'text' index deffined in the collection).
   */
  getSearchFilters: function(filters, request) {

    if(filters.search) {
      var q = stringUtil.unescapeQueryParam(filters.search);

      // override the sort options
      request.addOption('score', { $meta: 'textScore' });
      request.addOption('sortBy', { score: { $meta: 'textScore' } });

      return { $text: { $search: q, $language: 'none' } };
    }
    return {};
  },


  /**
   * Filter on model relations based on its size
   */
  getRelationSizeFilter: function(filters, filterName, attribute) {
    var ret = null;

    if(_.has(filters, filterName)) {
      ret = {};

      var v = filters[filterName];

      if(v && /^(>=|<=|=)\d$/.test(v)) {
        ret.$where = 'this.' + attribute + '.length' + v;
      } else {

        // assume the query just checks the value existence
        // (so a boolean value)
        // if no value, default to true
        if(_.isEmpty(v)) {
          v = true;
        } else {
          v = _.contains(['1', 'true'], String(v).toLowerCase());
        }

        var op1 = {}, op2 = {}, op3 = {};

        if(v) {
          ret[attribute+'.0'] = {$exists: true};

        } else {
          op1[attribute]      = {$exists: false};
          op2[attribute]      = {$eq:null};
          op3[attribute]      = {$eq:[]};

          ret.$or = [op1, op2, op3];
        }
      }
    }
    return ret;
  },

  /**
   * Similar to the previous filter, but for single related
   * entities (not arrays)
   */
  hasRelationFilter: function(filters, filterName, attribute) {
    var ret = null;

    if(_.has(filters, filterName)) {
      ret = {};

      var v = filters[filterName];

      // if no value, default to true
      if(_.isEmpty(v)) {
        v = true;
      } else {
        v = _.contains(['1', 'true'], String(v).toLowerCase());
      }

      var op1 = {}, op2 = {};

      if(v) {
        op1[attribute] = {$exists: true};
        op2[attribute] = {$not: { $in: [null, '']}};

        ret.$and = [op1, op2];

      } else {
        ret[attribute] = null;
      }
    }
    return ret;
  }

};

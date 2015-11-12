'use strict';

var
  _          = require('underscore'),
  sortParser = require('./requestSortParser'),
  stringUtil = require('./string'),
  config     = require('../../../config');


// default pagination opts
const defaultExpandOptions = { limit: config.pagination.defaultLimit, skip: 0 };


/**
 * Parses the requested expands extracting the pagination options
 * @param  {Array} expands  The requested expands
 * @return {Object}         The parsed expands
 */
var parseExpands = function(expands) {
  return _.reduce(expands, _parseExpand, {});
};


/**
 * Expand parsing (parses the options for that expand)
 * @param  {Object} populationOpts  Already parsed expands object
 * @param  {String} expand          The new expand to parse
 * @return {Object}                 The original parsed expands object
 *                                  with the new parsed expand added
 */
var _parseExpand = function(populationOpts, expand) {
  var
    expandParts = expand.split(':'),
    key         = expandParts.shift(),
    opts        = _.reduce(expandParts, _parseExpandOpt, _.clone(defaultExpandOptions)),
    page        = opts.page || 1;


  if(opts.limit > config.pagination.maxLimit) {
    opts.limit = config.pagination.maxLimit;
  }

  opts.skip = opts.limit * (page - 1);

  populationOpts[key] = {
    options: _.omit(opts, ['page', 'filter'])
  };

  if(opts.filter) {
    populationOpts[key].match = opts.filter;
  }

  return populationOpts;
};


/**
 * Expand option parsing
 * @param  {Object} opts    Already parsed expand options
 * @param  {String} rawOpt  The new option to parse
 * @return {Object}         The original options with the new parsed one added
 */
var _parseExpandOpt = function(opts, rawOpt) {
  var
    opt  = rawOpt.match(/^(\w+)\(/),
    args = rawOpt.match(/^\w+\((.*)\)/);

  if(opt && args) {
    opt  = opt[1];
    args = args[1];

    switch(opt) {
      case 'page':
        var page = parseInt(args, 10);
        /* istanbul ignore else */
        if(!isNaN(page) && page > 0) {
          opts.page = page;
        }
        break;

      case 'per_page':
      case 'limit':
        var limit = parseInt(args, 10);
        /* istanbul ignore else */
        if(!isNaN(limit)) {
          opts.limit = limit;
        }
        break;

      case 'sort':
        opts.sort = _.extend(opts.sort || {}, sortParser.parse(args));
        break;

      case 'filter':
        var parsedOpt;
        try {
          parsedOpt = JSON.parse(stringUtil.unescapeQueryParam(args));
        } catch(e) {}

        if(parsedOpt) {
          opts.filter = parsedOpt;
        }
    }
  }
  return opts;
};


module.exports = {
  parse:              parseExpands,
  _parseExpand:       _parseExpand,
  _parseExpandOpt:    _parseExpandOpt,
  paginationDefaults: defaultExpandOptions
};

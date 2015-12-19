'use strict';

var
  _                       = require('lodash'),
  apiBasePath             = '../../..',
  config                  = require('src/config'),
  Ticket                  = require('../models/Ticket'),
  filterPrivateAttributes = require(apiBasePath + '/util/filterPrivateAttributes');


/**
 * Output filter middleware
 *
 * Filters out some nodes from the response based on the user profile
 */
var outputFilter = function(req, res, next) {
  var originalJSONMethod = res.json.bind(res);

  res.json = function(data) {
    if(req.user.role === config.roles.user) {
      data.data = filterPrivateAttributes(Ticket, data.data);
    }
    originalJSONMethod(data);
  };

  next();
};


module.exports = outputFilter;

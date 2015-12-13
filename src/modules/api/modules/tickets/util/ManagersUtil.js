'use strict';

var
  // generic stuff
  _       = require('underscore'),
  async   = require('async'),

  // API utilities
  slugger = require('../../../util/slugger'),

  // Models
  Category = require('../models/Category'),
  Manager  = require('../../../models/Manager');


/**
 * Sets the managers for a category
 *
 * Sets the category managers, linking them (bidirectionally)
 *
 * @param {Category} category  The category model
 * @param {mixed}    managers  A manager object or an array of managers
 * @param {Function} next      Callback
 */
var setManagers = function(category, managers, next) {
  async.waterfall([

    function setup(callback) {
      // make sure it's an array
      if(!_.isArray(managers)) {
        managers = [managers];
      }

      callback(null, category, managers);
    },
    _updateManagersCategories,
    _updateCategoryManagers,

  ], function asyncComplete(err, model) {

    /* istanbul ignore next */
    if (err) { return next(err); }
    next(null, category);
  });
};


/**
 * Link/unlink the managers to the category
 * @private
 *
 * @param {Article}  category   The category model
 * @param {Array}    managers   The managers to assign.
 * @param {Function} next       Callback
 */
var _updateManagersCategories = function(category, managers, callback) {

  var
    currentManagers    = category.managers || [],
    managerIdsToLink   = managers.map(_getObjId),
    currentManagerIds  = currentManagers.map(_getObjId),
    managerIdsToUnlink = _.difference(currentManagerIds, managerIdsToLink),
    actions            = [];

  if(managerIdsToUnlink.length) {
    actions.push({
      criteria: { _id: {$in: managerIdsToUnlink} },
      update:   { $pull: { 'ticketCategories': category.id } }
    });
  }

  if(managerIdsToLink.length) {
    actions.push({
      criteria: { _id: {$in: managerIdsToLink} },
      update:   { $addToSet: { 'ticketCategories': category.id } }
    });
  }

  if(!actions.length) {
    callback(null, category, managers);
  } else {
    async.each(actions, function(action, cb) {

      Manager.update(action.criteria, action.update, {multi: true}, function(err, numAffected) {
        /* istanbul ignore next */
        if(err) { return cb(err); }
        cb(null);
      });

    }, function(err) {
      /* istanbul ignore next */
      if(err) { return callback(err); }
      callback(null, category, managers);
    });
  }
};


/**
 * Links the managers to a given Category
 * @private
 *
 * @param {Article}  category   The category model
 * @param {Array}    managers   The managers to assign.
 * @param {Function} next       Callback
 */
var _updateCategoryManagers = function(category, managers, callback) {

  category.managers = managers.map(_getObjId);
  category.save(function(err) {
    callback(null, category);
  });
};


/**
 * Aux. funct. When dealing with object nested relations,
 * the nexted objects can be expanded or they can be just Node ObjectIds
 * @private
 *
 * @param {mixed} tag The model or just its id
 * @return {String} the id
 */
var _getObjId = function(obj) {
  return obj.toHexString ? obj.toHexString() : obj.id;
};


module.exports = {
  setManagers:               setManagers,
  _updateManagersCategories: _updateManagersCategories,
  _updateCategoryManagers:   _updateCategoryManagers,
  _getObjId:                 _getObjId
};

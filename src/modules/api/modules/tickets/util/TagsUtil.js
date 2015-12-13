'use strict';

/*
  TODO: this file is almost identical to the one on the knowledge base,
  with the only difference being the referenced classes. So this should
  be rewriten, with the dependencies injected, for example.
 */

var
  // generic stuff
  _       = require('underscore'),
  async   = require('async'),

  // API utilities
  slugger = require('../../../util/slugger'),

  // Models
  Tag     = require('../models/Tag'),
  Ticket  = require('../models/Ticket');


/**
 * Sets the tags for an ticket
 *
 * Sets the ticket tags, linking them (bidirectionally),
 * and creating the tags if don't exist.
 *
 * @param {Ticket}  ticket The ticket model
 * @param {mixed}    tags    A tag object or an array of tags
 * @param {Function} next    Callback
 */
var setTags = function(ticket, tags, next) {
  async.waterfall([

    function setup(callback) {
      // make sure it's an array
      if(!_.isArray(tags)) {
        tags = [tags];
      }

      // remove dupplicates
      tags = _.uniq(tags, function(tag) {
        return tag.id || tag.name;
      });

      callback(null, ticket, tags);
    },

    _createUnexistingTags,

    _updateTagsTickets,

    _updateTicketTags,

  ], function asyncComplete(err, model) {

    /* istanbul ignore next */
    if (err) { return next(err); }
    next(null, ticket);
  });
};


/**
 * Creates the unexistant tags for an ticket
 * @private
 *
 * @param {Ticket}  ticket        The ticket model
 * @param {Array}    requestedTags  All the tags to assign.
 *                                  Only the unexistant ones will be created.
 * @param {Function} next           Callback
 */
var _createUnexistingTags = function(ticket, requestedTags, callback) {

  var
    newTicketTags = requestedTags.filter(function(tag) {
      return !!tag.id;
    }),
    tagsToCreate  = requestedTags.filter(function(tag) {
      return !tag.id && tag.name;
    }).map(function(tag) {
      return tag.name;
    });

  async.forEach(tagsToCreate, function(tagName, cb) {
    slugger(Tag, tagName, null, function(err, tagSlug) {
      var model = new Tag({
        name:     tagName,
        slug:     tagSlug,
        tickets: ticket.id
      });

      model.save(function(err) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        newTicketTags.push(model);
        cb();
      });
    });
  }, function(err) {
    /* istanbul ignore next */
    if(err) { return callback(err); }
    callback(null, ticket, newTicketTags);
  });
};


/**
 * Links the tags to a given Ticket updating the tags 'tickets' tag attributes
 * @private
 *
 * @param {Ticket}  ticket        The ticket model
 * @param {Array}    newTicketTags The tags to assign.
 * @param {Function} next           Callback
 */
var _updateTagsTickets = function(ticket, newTicketTags, callback) {

  var
    currentTags    = ticket.tags || [],
    tagsIdToLink   = newTicketTags.map(_getObjId),
    currentTagIds  = currentTags.map(_getObjId),
    tagIdsToUnlink = _.difference(currentTagIds, tagsIdToLink),
    actions        = [];

  if(tagIdsToUnlink.length) {
    actions.push({
      criteria: { _id: {$in: tagIdsToUnlink} },
      update:   { $pull: { 'tickets': ticket.id } }
    });
  }

  if(tagsIdToLink.length) {
    actions.push({
      criteria: { _id: {$in: tagsIdToLink} },
      update:   { $addToSet: { 'tickets': ticket.id } }
    });
  }

  if(!actions.length) {
    callback(null, ticket, newTicketTags);
  } else {
    async.each(actions, function(action, cb) {

      Tag.update(action.criteria, action.update, {multi: true}, function(err, numAffected) {
        /* istanbul ignore next */
        if(err) { return cb(err); }
        cb(null);
      });

    }, function(err) {
      /* istanbul ignore next */
      if(err) { return callback(err); }
      callback(null, ticket, newTicketTags);
    });
  }
};


/**
 * Links the tags to a given Ticket updating the ticket 'tags' attribute
 * @private
 *
 * @param {Ticket}  ticket        The ticket model
 * @param {Array}    newTicketTags The tags to assign.
 * @param {Function} next           Callback
 */
var _updateTicketTags = function(ticket, newTicketTags, callback) {

  ticket.tags = newTicketTags.map(_getObjId);
  ticket.save(function(err) {
    callback(null, ticket);
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
  setTags:               setTags,
  _createUnexistingTags: _createUnexistingTags,
  _updateTagsTickets:   _updateTagsTickets,
  _updateTicketTags:    _updateTicketTags,
  _getObjId:             _getObjId
};

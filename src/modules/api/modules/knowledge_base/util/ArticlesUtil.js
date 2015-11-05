'use strict';

var
  // generic stuff
  _       = require('underscore'),
  async   = require('async'),

  // API utilities
  slugger = require('../../../util/slugger'),

  // Models
  Article = require('../models/Article');


/**
 * Sets the articles for a model (like atag or a category)
 *
 * This is used on bidirectional relations (where the related
 * entity is defined on both sides - i know it sounds weird,
 * but the application does not us a relational database, so
 * some things are a bit different)
 * Sets the articles, linking them (bidirectionally)
 *
 * @param {Model}    instance The model instance
 * @param {mixed}    articles An article object or an array of articles
 * @param {Function} next     Callback
 */
var setArticles = function(instance, articles, callback) {
  /* istanbul ignore next */
  if(!_.isArray(articles)) { articles = [articles]; }

  var
    currentArticles    = instance.articles /* istanbul ignore next */ || [],
    articleIdsToLink   = articles.map(_getObjId),
    currentArticleIds  = currentArticles.map(_getObjId),
    articleIdsToUnlink = _.difference(currentArticleIds, articleIdsToLink),
    actions            = [],
    Model              = instance.constructor;

  if(articleIdsToUnlink.length) {
    actions.push({
      criteria: { _id: {$in: articleIdsToUnlink} },
      update:   { $pull: { 'tags': instance.id } }
    });
  }

  if(articleIdsToLink.length) {
    actions.push({
      criteria: { _id: {$in: articleIdsToLink} },
      update:   { $addToSet: { 'tags': instance.id } }
    });
  }

  if(!actions.length) {
    callback(null, instance);
  } else {
    async.each(actions, function(action, cb) {
      Article.update(action.criteria, action.update, {multi: true}, function(err, numAffected) {
        /* istanbul ignore next */
        if(err) { return cb(err); }
        cb(null);
      });

    }, function(err) {
      /* istanbul ignore next */
      if(err) { return callback(err); }

      instance.articles = _.unique(_.difference(currentArticleIds.concat(articleIdsToLink), articleIdsToUnlink));

      instance.save(function(err, instance) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        callback(null, instance);
      });
    });
  }
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
  setArticles: setArticles,
  _getObjId:   _getObjId
};

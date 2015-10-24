'use strict';

var
  // generic stuff
  _       = require('underscore'),
  async   = require('async'),

  // API utilities
  slugger = require('../../../util/slugger'),

  // Models
  Tag     = require('../models/Tag'),
  Article = require('../models/Article');


  /**
   * Sets the articles for a tag
   *
   * Sets the tag articles, linking them (bidirectionally),
   *
   * @param {Tag}      tag      The Tag model
   * @param {mixed}    articles An article object or an array of articles
   * @param {Function} next     Callback
   */
var setTagArticles = function(tag, articles, callback) {
  var
    currentArticles    = tag.articles /* istanbul ignore next */ || [],
    articleIdsToLink   = articles.map(_getObjId),
    currentArticleIds  = currentArticles.map(_getObjId),
    articleIdsToUnlink = _.difference(currentArticleIds, articleIdsToLink),
    actions            = [];

  if(articleIdsToUnlink.length) {
    actions.push({
      criteria: { _id: {$in: articleIdsToUnlink} },
      update:   { $pull: { 'tags': tag.id } }
    });
  }

  if(articleIdsToLink.length) {
    actions.push({
      criteria: { _id: {$in: articleIdsToLink} },
      update:   { $addToSet: { 'tags': tag.id } }
    });
  }

  if(!actions.length) {
    callback(null, tag);
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

      tag.articles = _.unique(_.difference(currentArticleIds.concat(articleIdsToLink), articleIdsToUnlink));

      tag.save(function(err, tag) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        callback(null, tag);
      });
    });
  }
};


/**
 * Sets the tags for an article
 *
 * Sets the article tags, linking them (bidirectionally),
 * and creating the tags if don't exist.
 *
 * @param {Article}  article The article model
 * @param {mixed}    tags    A tag object or an array of tags
 * @param {Function} next    Callback
 */
var setArticleTags = function(article, tags, next) {
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

      callback(null, article, tags);
    },

    _createUnexistingTags,
    _updateTagsArticles,
    _updateArticleTags,

  ], function asyncComplete(err, model) {

    /* istanbul ignore next */
    if (err) { return next(err); }
    next(null, article);
  });
};


/**
 * Creates the unexistant tags for an article
 * @private
 *
 * @param {Article}  article        The article model
 * @param {Array}    requestedTags  All the tags to assign.
 *                                  Only the unexistant ones will be created.
 * @param {Function} next           Callback
 */
var _createUnexistingTags = function(article, requestedTags, callback) {

  var
    newArticleTags = requestedTags.filter(function(tag) {
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
        articles: article.id
      });

      model.save(function(err) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        newArticleTags.push(model);
        cb();
      });
    });
  }, function(err) {
    /* istanbul ignore next */
    if(err) { return callback(err); }
    callback(null, article, newArticleTags);
  });
};


/**
 * Links the tags to a given Article updating the tags 'articles' tag attributes
 * @private
 *
 * @param {Article}  article        The article model
 * @param {Array}    newArticleTags The tags to assign.
 * @param {Function} next           Callback
 */
var _updateTagsArticles = function(article, newArticleTags, callback) {

  var
    currentTags    = article.tags || [],
    tagsIdToLink   = newArticleTags.map(_getObjId),
    currentTagIds  = currentTags.map(_getObjId),
    tagIdsToUnlink = _.difference(currentTagIds, tagsIdToLink),
    actions        = [];

  if(tagIdsToUnlink.length) {
    actions.push({
      criteria: { _id: {$in: tagIdsToUnlink} },
      update:   { $pull: { 'articles': article.id } }
    });
  }

  if(tagsIdToLink.length) {
    actions.push({
      criteria: { _id: {$in: tagsIdToLink} },
      update:   { $addToSet: { 'articles': article.id } }
    });
  }

  if(!actions.length) {
    callback(null, article, newArticleTags);
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
      callback(null, article, newArticleTags);
    });
  }
};


/**
 * Links the tags to a given Article updating the article 'tags' attribute
 * @private
 *
 * @param {Article}  article        The article model
 * @param {Array}    newArticleTags The tags to assign.
 * @param {Function} next           Callback
 */
var _updateArticleTags = function(article, newArticleTags, callback) {

  article.tags = newArticleTags.map(_getObjId);
  article.save(function(err) {
    callback(null, article);
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
  setArticleTags:        setArticleTags,
  setTagArticles:        setTagArticles,
  _createUnexistingTags: _createUnexistingTags,
  _updateTagsArticles:   _updateTagsArticles,
  _updateArticleTags:    _updateArticleTags,
  _getObjId:             _getObjId
};

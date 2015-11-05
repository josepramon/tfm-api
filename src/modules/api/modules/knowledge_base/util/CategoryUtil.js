'use strict';

var
  // generic stuff
  _        = require('underscore'),
  async    = require('async'),

  // API utilities
  slugger  = require('../../../util/slugger'),

  // Models
  Category = require('../models/Category'),
  Article  = require('../models/Article');


/**
 * Sets the category for a model
 *
 * Sets the category, linking them (bidirectionally),
 * and creating the category if doesn't exist.
 *
 * @param {Article}  article  The article model
 * @param {Object}   category The category
 * @param {Function} next     Callback
 */
var setCategory = function(article, category, next) {
  async.waterfall([

    function setup(callback) {
      callback(null, article, category);
    },

    _createUnexistingCategory,

    _updateCategoryArticles,

    _updateArticleCategory,

  ], function asyncComplete(err, model) {

    /* istanbul ignore next */
    if (err) { return next(err); }
    next(null, article);
  });
};


/**
 * Creates the unexistant category for an article
 * @private
 *
 * @param {Article}  article           The article model
 * @param {Object}   requestedCategory The new category
 *                                     Will be created only if it does not exist.
 * @param {Function} next              Callback
 */
var _createUnexistingCategory = function(article, requestedCategory, callback) {

  if(requestedCategory && !requestedCategory.id && requestedCategory.name) {

    slugger(Category, requestedCategory.name, null, function(err, categorySlug) {
      var model = new Category({
        name:     requestedCategory.name,
        slug:     categorySlug,
        articles: article.id
      });

      model.save(function(err) {
        /* istanbul ignore next */
        if(err) { return callback(err); }
        callback(null, article, model);
      });
    });

  } else {
    callback(null, article, requestedCategory);
  }

};


/**
 * Links the category to a given Article updating the category 'articles' attribute
 * @private
 *
 * @param {Article}  article   The article model
 * @param {Object}   category  The category to assign.
 * @param {Function} next      Callback
 */
var _updateCategoryArticles = function(article, category, callback) {

  var actions = [];

  // unlink to previous category
  actions.push({
    criteria: {},
    update:   { $pull: { 'articles': article.id } }
  });

  if(category) {
    var categoryId = _getObjId(category);

    // link to the new one
    actions.push({
      criteria: { _id: categoryId },
      update:   { $addToSet: { 'articles': article.id } }
    });
  }


  if(!actions.length) {
    callback(null, article, category);
  } else {
    async.each(actions, function(action, cb) {
      Category.update(action.criteria, action.update, {multi: true}, function(err, numAffected) {
        /* istanbul ignore next */
        if(err) { return cb(err); }
        cb(null);
      });

    }, function(err) {
      /* istanbul ignore next */
      if(err) { return callback(err); }
      callback(null, article, category);
    });
  }
};


/**
 * Links the category to a given Article updating the article 'category' attribute
 * @private
 *
 * @param {Article}  article   The article model
 * @param {Object}   category  The category to assign.
 * @param {Function} next      Callback
 */
var _updateArticleCategory = function(article, category, callback) {

  article.category = category ? _getObjId(category) : null;
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
  setCategory:               setCategory,
  _createUnexistingCategory: _createUnexistingCategory,
  _updateCategoryArticles:   _updateCategoryArticles,
  _updateArticleCategory:    _updateArticleCategory,
  _getObjId:                 _getObjId
};

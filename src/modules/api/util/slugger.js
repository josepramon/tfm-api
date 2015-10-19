'use strict';

var
  slug = require('slug'),
  _    = require('underscore');


/**
 * Slug generator
 *
 * Generates a UNIQUE slug for some model. If there's already a document
 * with the same slug, a numeric suffix will be added. So, for example, if
 * the desired slug is 'foo' and there's already a document with that slug,
 * 'foo-1' will be returned.
 *
 * @param  {Model}    Model        The model class
 * @param  {String}   instanceName Instance 'name' (title or whatever). It will be
 *                                 used to generate the slug if no slug is provided
 * @param  {String}   instanceSlug Desired slug, optional
 * @param  {Function} callback     This method is async, so callback funct. to
 *                                 execute. It will receive the unique generated slug
 *                                 as a parameter.
 */
module.exports = function(Model, instanceName, instanceSlug, callback) {

  if(!Model)                         { return callback(new Error()); }
  if(!instanceName && !instanceSlug) { return callback(new Error()); }

  var
      /**
       * The attribute to use (the slug by default)
       * @type {String}
       */
      attr = instanceSlug || instanceName,

      /**
       * The generated slug (generate one even if a slug is provided,
       * so unadequate characters will be transformed/removed)
       * @type {[type]}
       */
      objSlug = slug(attr),

      /**
       * Regular expression to search for existing docs. with the same slug
       * @type {RegExp}
       */
      regex = new RegExp('^' + objSlug + '(-\\d+)?$', 'i');


    Model.find({slug: regex}, function(err, models) {
      /* istanbul ignore next */
      if(err) { return callback(err); }

      if (!models.length) {
        // No match, return the generated slug
        callback(null, objSlug);
      } else {

        var slugIsUsed = models.map(function(model) {
          return model.slug;
        }).indexOf(objSlug) > -1;


        if(!slugIsUsed) {
          // No exact match, return the generated slug
          callback(null, objSlug);
        } else {

          // Found some docs. with matching slugs.
        // Get the numeric suffixes.
        var suffixes = _.compact(models.map(function(model) {
          var str = model.slug.match(regex)[1];

          if(str) {
            return parseInt(str.replace('-',''), 10);
          }
        }));

        // Add the suffix
        var max = 0;
        if(suffixes.length) {
          max = Math.max.apply(null, suffixes);
        }
        objSlug += '-' + (max+1);

        callback(null, objSlug);

        }
      }
    });
};

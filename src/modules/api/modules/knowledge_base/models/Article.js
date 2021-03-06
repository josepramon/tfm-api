'use strict';

var
  mongoose         = require('mongoose'),
  Schema           = mongoose.Schema,
  dateUtil         = require('src/lib/dateUtil'),
  AttachmentSchema = require('../../../models/schemas/Attachment'),
  Tag, Category;


var ArticleSchema = new Schema({
  title        : { type: String, required: true },
  slug         : { type: String, required: true, unique: true, default: 'slug' },
  excerpt      : String,
  body         : String,
  commentable  : { type: Boolean, default: false},

  tags         : [{ type: Schema.ObjectId, ref: 'KBTag' }],
  category     : { type: Schema.ObjectId, ref: 'KBCategory' },

  published    : { type: Boolean, default: false},
  publish_date : { type: Date, default: Date.now },

  created_at   : { type: Date, default: Date.now },
  updated_at   : { type: Date, default: Date.now },

  weight       : { type: Number, default: null },

  attachments  : [AttachmentSchema]
}, {

  toJSON: {
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.__v;

      // convert the dates to timestamps
      ret.created_at   = dateUtil.dateToTimestamp(ret.created_at);
      ret.updated_at   = dateUtil.dateToTimestamp(ret.updated_at);
      ret.publish_date = dateUtil.dateToTimestamp(ret.publish_date);
    }
  },

  'collection': 'knowledge_base.articles'

});


// Remove relations from other collections
ArticleSchema.pre('remove', function (next) {
  var
    article  = this,
    criteria = { _id: {$in: article.tags} },
    update   = { $pull: { 'articles': article._id } };


  if(!article.tags.length) {
    next();
  } {
    // requiring at runtime to avoid circular dependencies
    Tag = Tag || require('./Tag');

    Tag.update(criteria, update, {multi:true}, function(err, numAffected) {
      /* istanbul ignore next */
      if(err) { return next(err); }
      next();
    });
  }
});
ArticleSchema.pre('remove', function (next) {
  var
    article  = this,
    criteria = { _id: article.category },
    update   = { $pull: { 'articles': article._id } };


  if(!article.category) {
    next();
  } {
    // requiring at runtime to avoid circular dependencies
    Category = Category || require('./Category');

    Category.update(criteria, update, {multi:true}, function(err, numAffected) {
      /* istanbul ignore next */
      if(err) { return next(err); }
      next();
    });
  }
});


// Secondary indexes
// ----------------------------------
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ weight: 1, publish_date: 1 });

ArticleSchema.index({
  title:   'text',
  excerpt: 'text',
  body:    'text'
}, {
  weights: {
    title:   5,
    excerpt: 2,
    body:    1
  },
  name: 'ArticlesTextIndex'
});

// Custom methods and attributes
// ----------------------------------
ArticleSchema.statics.safeAttrs = ['title', 'excerpt', 'body', 'published', 'publish_date', 'commentable', 'weight'];
ArticleSchema.methods.getRefs = function() { return ['tags', 'category', 'attachments']; };


// Register the plugins
// ----------------------------------
ArticleSchema.plugin( require('mongoose-paginate') );
ArticleSchema.plugin( require('mongoose-deep-populate')(mongoose) );
ArticleSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var KBArticleModel = mongoose.models.KBArticle ?
  mongoose.model('KBArticle') : mongoose.model('KBArticle', ArticleSchema);


module.exports = KBArticleModel;

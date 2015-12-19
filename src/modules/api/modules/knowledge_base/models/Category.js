'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  dateUtil = require('src/lib/dateUtil'),
  Article;


var CategorySchema = new Schema({
  name         : { type: String, required: true, unique: true },
  slug         : { type: String, required: true, unique: true, default: 'slug' },
  description  : String,
  articles     : [{ type: Schema.ObjectId, ref: 'KBArticle'}],
  created_at   : { type: Date, default: Date.now },
  updated_at   : { type: Date, default: Date.now },
  weight       : { type: Number, default: null },
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
    }
  },

  'collection': 'knowledge_base.categories'

});



// Remove relations from other collections
CategorySchema.pre('remove', function (next) {
  var
    category = this,
    criteria = { _id: {$in: category.articles} },
    update   = { category: null };


  if(!category.articles.length) {
    next();
  } {
    // requiring at runtime to avoid circular dependencies
    Article = Article || require('./Article');

    Article.update(criteria, update, {multi:true}, function(err, numAffected) {
      /* istanbul ignore next */
      if(err) { return next(err); }
      next();
    });
  }
});


// Secondary indexes
// ----------------------------------
CategorySchema.index({ articles: 1 });
CategorySchema.index({ weight: 1 });
CategorySchema.index({
  name:        'text',
  description: 'text'
}, {
  weights: {
    name:        5,
    description: 1
  },
  name: 'CategoriesTextIndex'
});


// Custom methods and attributes
// ----------------------------------
CategorySchema.statics.safeAttrs = ['name', 'description', 'weight'];
CategorySchema.methods.getRefs = function() { return ['articles']; };


// Register the plugins
// ----------------------------------
CategorySchema.plugin( require('mongoose-paginate') );
CategorySchema.plugin( require('mongoose-deep-populate')(mongoose) );
CategorySchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var KBCategoryModel = mongoose.models.KBCategory ?
  mongoose.model('KBCategory') : mongoose.model('KBCategory', CategorySchema);


module.exports = KBCategoryModel;

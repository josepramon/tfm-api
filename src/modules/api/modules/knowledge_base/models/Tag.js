'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  dateUtil = require('src/lib/dateUtil'),
  Article;


var TagSchema = new Schema({
  name         : { type: String, required: true, unique: true },
  slug         : { type: String, required: true, unique: true, default: 'slug' },
  description  : String,
  articles     : [{ type: Schema.ObjectId, ref: 'KBArticle'}],
  created_at   : { type: Date, default: Date.now },
  updated_at   : { type: Date, default: Date.now }
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

  'collection': 'knowledge_base.tags'

});



// Remove relations from other collections
TagSchema.pre('remove', function (next) {
  var
    tag      = this,
    criteria = { _id: {$in: tag.articles} },
    update   = { $pull: { 'tags': tag._id } };


  if(!tag.articles.length) {
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
TagSchema.index({ articles: 1 });
TagSchema.index({
  name:        'text',
  description: 'text'
}, {
  weights: {
    name:        5,
    description: 1
  },
  name: 'TagsTextIndex'
});


// Custom methods and attributes
// ----------------------------------
TagSchema.statics.safeAttrs = ['name', 'description'];
TagSchema.methods.getRefs = function() { return ['articles']; };


// Register the plugins
// ----------------------------------
TagSchema.plugin( require('mongoose-paginate') );
TagSchema.plugin( require('mongoose-deep-populate')(mongoose) );
TagSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var KBTagModel = mongoose.models.KBTag ?
  mongoose.model('KBTag') : mongoose.model('KBTag', TagSchema);


module.exports = KBTagModel;

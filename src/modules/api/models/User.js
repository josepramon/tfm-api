'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  bcrypt   = require('bcryptjs'),
  gravatar = require('gravatar'),
  dateUtil = require('../../../lib/dateUtil'),
  role     = require('./Role');

// register some additional schema types
var mongooseTypes = require('mongoose-types');
mongooseTypes.loadTypes(mongoose);


var UserSchema = new Schema({

  username: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true,
    required: true
  },

  role: {
    type: Schema.ObjectId,
    ref: 'Role',
    required: true
  },

  // other user details
  profile: {},

  created_at : { type: Date, default: Date.now },
  updated_at : { type: Date, default: Date.now }

}, {

  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.__v;
      delete ret.password;

      // format the role/privileges nodes
      role = doc.role || {};
      ret.role       = role.name,
      ret.privileges = role.privileges,

      // convert the dates to timestamps
      ret.created_at   = dateUtil.dateToTimestamp(ret.created_at);
      ret.updated_at   = dateUtil.dateToTimestamp(ret.updated_at);
    }
  },
  toObject: {
    virtuals: true,
    transform: /* istanbul ignore next */ function(doc, ret) {
      // transform id to _id
      ret._id = ret.id;
      delete ret.id;
    }
  }

});



// Bcrypt middleware on UserSchema
// Hashes the password before saving the model to the database
UserSchema.pre('save', function (next) {
  var user = this;

  /* istanbul ignore else */
  if (this.isModified('password') || /* istanbul ignore next */ this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      /* istanbul ignore next */
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        /* istanbul ignore next */
        if (err) {
          return next(err);
        }

        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Gravatar middleware on UserSchema
// Sets a the user avatar from gravatar (if no custom avatar supplied)
// before saving the model to the database
UserSchema.pre('save', function (next) {
  var user = this;

  if(!user.profile) {
    user.profile = {};
  }

  if(!user.profile.avatar) {
    user.profile.avatar = gravatar.url(user.email);
  }

  next();
});


// Custom methods and attributes
// ----------------------------------
UserSchema.statics.safeAttrs = ['username', 'email', 'profile'];
UserSchema.methods.getRefs = function() { return []; };

//Password verification
UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    /* istanbul ignore next */
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};


UserSchema.methods.setPassword = function setPassword (newPassword, oldPassword, cb) {
  var self = this;

  this.comparePassword(oldPassword, function(err, match) {
    /* istanbul ignore next */
    if (err) {
      return cb(err);
    }

    if(match) {
      self.password = newPassword;
    } else {
      var validationError = new Error('Incorrect password');

      self.invalidate('oldPassword', validationError);
    }
    cb(null);
  });
};


// Register the plugins
// ----------------------------------
UserSchema.plugin( require('mongoose-paginate') );
UserSchema.plugin( require('mongoose-deep-populate')(mongoose) );
UserSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var UserModel = mongoose.models.User ?
  mongoose.model('User') : mongoose.model('User', UserSchema);

module.exports = UserModel;

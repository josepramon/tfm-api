'use strict';

var
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  bcrypt   = require('bcryptjs');


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
    type: String,
    unique: true,
    required: true
  }

}, {

  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // transform _id to id
      ret.id = ret._id;
      delete ret._id;

      // filter out some attributes from the output
      delete ret.password;
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


// Custom methods and attributes
// ----------------------------------
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


// Register the plugins
// ----------------------------------
UserSchema.plugin( require('mongoose-paginate') );
UserSchema.plugin( require('mongoose-time')() );


/* istanbul ignore next */
var UserModel = mongoose.models.User ?
  mongoose.model('User') : mongoose.model('User', UserSchema);

module.exports = UserModel;

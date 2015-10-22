'use strict';

var bcrypt = require('bcryptjs');

module.exports = {
  hashPassword: function(password) {
    var
      salt = bcrypt.genSaltSync(10),
      hash = bcrypt.hashSync(password, salt);

    return hash;
  }
};

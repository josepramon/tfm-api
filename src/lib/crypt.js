'use strict';

var
  bcrypt    = require('bcryptjs'),
  crypto    = require('crypto'),
  config    = require('../config'),
  algorithm = 'aes-256-ctr';


module.exports = {
  hashPassword: function(password) {
    var
      salt = bcrypt.genSaltSync(10),
      hash = bcrypt.hashSync(password, salt);

    return hash;
  },

  crypt: function(buffer) {
    var
      cipher  = crypto.createCipher(algorithm, config.cryptKey),
      crypted = cipher.update(buffer, 'utf8', 'hex') + cipher.final('hex');
    return crypted;
  },

  decrypt: function (buffer){
    var
      cipher    = crypto.createDecipher(algorithm, config.cryptKey),
      decrypted = cipher.update(buffer, 'hex', 'utf8') + cipher.final('utf8');
    return decrypted;
  }
};

module.exports = (function() {
  'use strict';

  var
    faker  = require('faker'),
    data   = [],
    id     = require('pow-mongodb-fixtures').createObjectId,
    bcrypt = require('bcryptjs');


  var hashPassword = function(password) {
    var
      salt = bcrypt.genSaltSync(10),
      hash = bcrypt.hashSync(password, salt);

    return hash;
  };


  // default user
  data.push({
    _id:      id('000000000000000000000001'),
    username: 'demo',
    password: hashPassword('demo'),
    email:    'demo@demo.demo'
  });

  for(var i=0, l=10; i < l; i++) {
    data.push({
      username : faker.internet.userName(),
      password : hashPassword(faker.internet.password()),
      email    : faker.internet.email()
    });
  }

  return data;

})();

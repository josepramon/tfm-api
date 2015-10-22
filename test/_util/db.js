var
  mongoose          = require('mongoose'),
  mongoConfigParser = require('src/lib/mongoConfigParser'),
  config            = require('src/config')


var mongoConn = new mongoConfigParser().setEnv({
  host     : config.mongo.test.host,
  port     : config.mongo.test.port,
  user     : config.mongo.test.user,
  password : config.mongo.test.password,
  database : config.mongo.test.database
});

module.exports = {
  connect: function(callback) {
    mongoose.connect(mongoConn.getConnectionString(), mongoConn.getConnectionOptions());
    mongoose.connection.once('open', callback);
  },

  disconnect: function(callback) {
    mongoose.connection.close(callback);
  }
};

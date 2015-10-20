var
  mongoose          = require('mongoose'),
  mongoConfigParser = require('src/lib/mongoConfigParser'),
  config            = require('src/config')


var mongoConn = new mongoConfigParser().setEnv({
  host     : config.mongo.host,
  port     : config.mongo.port,
  user     : config.mongo.user,
  password : config.mongo.password,
  database : config.mongo.database
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

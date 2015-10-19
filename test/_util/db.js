var
  mongoose          = require('mongoose'),
  mongoConfigParser = require('src/lib/mongoConfigParser');

var mongoConn = new mongoConfigParser().setEnv({
  host     : process.env.MONGO_HOST,
  port     : process.env.MONGO_PORT,
  user     : process.env.MONGO_USER,
  password : process.env.MONGO_PASSWORD,
  database : process.env.MONGO_DATABASE
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

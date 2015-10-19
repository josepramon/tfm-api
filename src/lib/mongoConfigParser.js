'use strict';

var
  os = require('os'),
  fs = require('fs'),
  _  = require('underscore');


var MongoConfigParser = function() {

  // default config
  var env = {
    'host'     : 'localhost',
    'port'     : 27017,
    'database' : 'test' // default mongo DB
  };


  /**
   * Environment getter
   *
   * Returns the apppropiate environment file (a json, so returned as an obj).
   * If there's a file called {yourHostName}.json it will be returned.
   * If not found, it will search for a file called default.json.
   * If that file is not found neuiither, it will return false.
   *
   * @param  {String} envDir environment directory that contains the env. config. files
   * @return {Object}        environment obj. with its properties (host, port, user, pass and dbName)
   *                         or false if not found
   */
  var getEnvObj = function(envDir) {
    if(!envDir || !fs.existsSync(envDir)) {
      return false;
    }

    var
      base = envDir + '/',
      ext  = '.json',
      customEnvFilePath  = base + os.hostname().toLowerCase() + ext,
      defaultEnvFilePath = base + 'default' + ext,
      data;

    /* istanbul ignore else  */
    if(fs.existsSync(customEnvFilePath)) {
      data = fs.readFileSync(customEnvFilePath, 'utf8');
    } else if(fs.existsSync(defaultEnvFilePath)) {
      data = fs.readFileSync(defaultEnvFilePath, 'utf8');
    }

    return data ? JSON.parse(data) : false;
  };


  /**
   * Environment extender: merges the defaults with the propperties of the supplied obj
   * @param {Object} envObj
   */
  var setEnvObj = function(envObj) {
    if(envObj) {
      env = _.extend(env, envObj);
    }
  };


  return {

    /**
     * Environment setter
     * @param {Object} envObj obj. with the following keys
     *                        (all of them are optional):
     *                          "host"     : string, mongo host name
     *                          "port"     : int, mongo port
     *                          "user"     : string, mongo user name
     *                          "password" : string, mongo password
     *                          "database" : string, mongo db name
     */
    setEnv : function(envObj) {
      setEnvObj(envObj);

      // make the method chainable
      return this;
    },


    /**
     * Environment getter
     * @return {Object} obj. with the following keys
     *                        (if set):
     *                          "host"     : string, mongo host name
     *                          "port"     : int, mongo port
     *                          "user"     : string, mongo user name
     *                          "password" : string, mongo password
     *                          "database" : string, mongo db name
     */
    getEnv : function() {
      return env;
    },


    /**
     * Environment setter (set the env. dir and it will load the appropiate file)
     * @param {string} dir environment directory path
     */
    setEnvDir : function(dir) {
      setEnvObj( getEnvObj(dir) );

      // make the method chainable
      return this;
    },


    /**
     * Returns the mongo conn. string using the environment if deffined or using default values
     * @return {String} mongo connection string
     */
    getConnectionString : function() {
      var ret;

      // set the proto
      ret = 'mongodb://';

      // set the host
      ret += env.host;

      // set the port
      ret += ':' + env.port;

      // set the database name
      ret += '/' + env.database;

      return ret;
    },

    /**
     * Returns the mongo connection options (currently only the user and password)
     *
     * The user and password are passed to mongoose independently from the connection
     * string so they can contain weird characters like '@' that would break the
     * connection string
     *
     * @return {Object}
     */
    getConnectionOptions : function() {
      var ret = {};

      // set the user/password
      if(env.user) {
        ret.user = env.user;
        if(env.password) {
          ret.pass = env.password;
        }
      }

      return ret;
    }
  };

};


module.exports = MongoConfigParser;

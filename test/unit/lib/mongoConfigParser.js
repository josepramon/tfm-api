'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  mockery        = require('mockery'),
  mockFs         = require('mock-fs'),
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  parser;




describe('lib/mongoConfigParser', function() {

  var parserDefaultResponse = {
    host     : 'localhost',
    port     : 27017,
    database : 'test'
  };

  var osStub = {};


  before(function(done) {

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    osStub = {};
    osStub.hostname = sinon.stub();
    osStub.hostname.returns('defaulthostname');

    mockery.registerMock('os', osStub);

    // must be loaded after mocking os
    parser = requireHelper('lib/mongoConfigParser');

    done();
  });


  after(function(done) {
    mockery.deregisterAll();
    mockery.disable();
    done();
  });


  describe('#getEnv', function() {

    it('should set the config params with a default properties if none supplied', function(done) {

      var mongoConn = new parser().getEnv();

      expect(mongoConn.host).to.be.equal(parserDefaultResponse.host);
      expect(mongoConn.port).to.be.equal(parserDefaultResponse.port);
      expect(mongoConn.database).to.be.equal(parserDefaultResponse.database);

      done();
    });

  });


  describe('#setEnv', function() {

    it('should extend the config params with the provided properties', function(done) {

      var mongoConn;

      // test with all the params
      mongoConn = new parser()
        .setEnv({
          host     : '10.0.0.0',
          port     : 1234,
          database : 'myDB',
          user     : 'userName',
          password : 'secret'
        })
        .getEnv();

      expect(mongoConn.host).to.be.equal('10.0.0.0');
      expect(mongoConn.port).to.be.equal(1234);
      expect(mongoConn.database).to.be.equal('myDB');
      expect(mongoConn.user).to.be.equal('userName');
      expect(mongoConn.password).to.be.equal('secret');


      // test with some params
      mongoConn = new parser()
        .setEnv({
          host     : '10.0.0.0',
          port     : 1234,
          user     : 'userName'
        })
        .getEnv();

      expect(mongoConn.host).to.be.equal('10.0.0.0');
      expect(mongoConn.port).to.be.equal(1234);
      expect(mongoConn.database).to.be.equal(parserDefaultResponse.database);
      expect(mongoConn.user).to.be.equal('userName');
      expect(mongoConn.password).to.be.undefined;

      done();
    });

  });


  describe('#setEnvDir', function() {

    afterEach(function(done) {
      mockFs.restore();
      done();
    });


    it('should set the config to the default config file content if there\'s no specific host config file', function(done) {

      mockFs({
        'envDir' : {
          'default.json' : '{ "host" : "localhost", "port" : 27017, "user" : null, "password" : null, "database" : "tfmAPI" }'
        }
      });

      var mongoConn = new parser().setEnvDir('envDir').getEnv();

      expect(mongoConn.host).to.be.equal('localhost');
      expect(mongoConn.port).to.be.equal(27017);
      expect(mongoConn.database).to.be.equal('tfmAPI_test');
      expect(mongoConn.user).to.be.null;
      expect(mongoConn.password).to.be.null;

      done();
    });


    it('should set the config to the contents of the file matching the hostName if found', function(done) {

      mockFs({
        'envDir' : {
          'default.json' : '{ "host" : "localhost", "port" : 27017, "user" : null, "password" : null, "database" : "tfmAPI" }',
          'defaulthostname.json' : '{ "host" : "defaultHostName", "port" : 1234, "user" : "userName", "password" : "secret", "database" : "whatever" }',
        }
      });

      var mongoConn = new parser().setEnvDir('envDir').getEnv();

      expect(osStub.hostname.called).to.be.true;

      expect(mongoConn.host).to.be.equal('defaultHostName');
      expect(mongoConn.port).to.be.equal(1234);
      expect(mongoConn.database).to.be.equal('whatever');
      expect(mongoConn.user).to.be.equal('userName');
      expect(mongoConn.password).to.be.equal('secret');

      done();
    });


    it('should set the config to the contents of the default env. file if there\'s no file matching the host name', function(done) {

      mockFs({
        'envDir' : {
          'default.json' : '{ "host" : "localhost", "port" : 27017, "user" : null, "password" : null, "database" : "tfmAPI" }',
          'nonMatchingRandomName.json' : '{ "host" : "defaultHostName", "port" : 1234, "user" : "userName", "password" : "secret", "database" : "whatever" }',
        }
      });

      var mongoConn = new parser().setEnvDir('envDir').getEnv();

      expect(osStub.hostname.called).to.be.true;

      expect(mongoConn.host).to.be.equal('localhost');
      expect(mongoConn.port).to.be.equal(27017);
      expect(mongoConn.database).to.be.equal('tfmAPI');
      expect(mongoConn.user).to.be.null;
      expect(mongoConn.password).to.be.null;

      done();
    });


    it('should do nothing and keep the default environment if file matching the hostName is empty', function(done) {

      mockFs({
        'envDir' : {
          'defaulthostname.json' : ''
        }
      });

      var mongoConn = new parser().setEnvDir('envDir').getEnv();

      expect(osStub.hostname.called).to.be.true;

      expect(mongoConn.host).to.be.equal(parserDefaultResponse.host);
      expect(mongoConn.port).to.be.equal(parserDefaultResponse.port);
      expect(mongoConn.database).to.be.equal(parserDefaultResponse.database);
      expect(mongoConn.user).to.be.undefined;
      expect(mongoConn.password).to.be.undefined;

      done();
    });


    it('should do nothing and keep the default environment if the env. dir supplied does not exist', function(done) {

      mockFs({
        'foo' : {}
      });

      var
        mongoConn = new parser(),
        defaults  = mongoConn.getEnv(),
        env;

      mongoConn.setEnvDir('bar');

      env = mongoConn.getEnv();

      expect(env.host).to.be.equal(defaults.host);
      expect(env.port).to.be.equal(defaults.port);
      expect(env.database).to.be.equal(defaults.database);

      done();
    });


    it('should do nothing and keep the default environment if no env. dir supplied', function(done) {

      var
        mongoConn = new parser(),
        defaults  = mongoConn.getEnv(),
        env;

      mongoConn.setEnvDir();

      env = mongoConn.getEnv();

      expect(env.host).to.be.equal(defaults.host);
      expect(env.port).to.be.equal(defaults.port);
      expect(env.database).to.be.equal(defaults.database);

      done();
    });

  });


  describe('#getConnectionString', function() {

    it('should return a valid mongo connection string', function(done) {
      var mongoConnStr = new parser().getConnectionString();

      expect(mongoConnStr).to.match(/^mongodb:\/\/[A-Za-z0-9_\-]+\:\d{1,5}\/[A-Za-z]+/);
      done();
    });

  });


  describe('#getConnectionOptions', function() {

    it('should not return user nor password if there\'s no mongo userName defined', function(done) {

      var opts = new parser().getConnectionOptions();

      expect(opts.user).to.be.undefined;
      expect(opts.pass).to.be.undefined;
      done();
    });


    it('should return the user if defined', function(done) {
      var opts = new parser()
        .setEnv({
          user : 'userName'
        })
        .getConnectionOptions();

      expect(opts.user).not.to.be.undefined;
      done();
    });


    it('should not return the password if not defined', function(done) {
      var opts = new parser()
        .setEnv({
          user : 'userName'
        })
        .getConnectionOptions();

      expect(opts.pass).to.be.undefined;
      done();
    });


    it('should return the user and password if they are both defined', function(done) {

      var opts = new parser()
        .setEnv({
          user     : 'userName',
          password : 'secret'
        })
        .getConnectionOptions();

      expect(opts.user).to.be.equal('userName');
      expect(opts.pass).to.be.equal('secret');
      done();
    });

  });

});

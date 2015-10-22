'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  mockery        = require('mockery'),
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  jwtAuth;


var mockRedis = function() {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  });

  // mock redis
  mockery.registerSubstitute('redis', 'redis-mock');

  // must be loaded after mocking redis
  jwtAuth = requireHelper('lib/jwtAuth');
};

var unmockRedis = function() {
  mockery.deregisterAll();
  mockery.disable();

  // reload
  jwtAuth = requireHelper('lib/jwtAuth');
};



describe('lib/jwtAuth', function() {

  before(function(done) {
    this.timeout(10000);
    mockRedis();
    done();
  });


  after(function(done) {
    this.timeout(10000);
    unmockRedis();
    done();
  });



  describe('fetch', function() {

    it('should return null if there\'s no authorization header', function(done) {

      var headers = {
        'accept-language' : 'en-US,en;',
        'user-agent'      : 'Whatever'
      };

      expect( jwtAuth.fetch() ).to.be.null;
      expect( jwtAuth.fetch(headers) ).to.be.null;

      done();
    });


    it('should return the token if the authorization header is well formed', function(done) {

      var
        headers = {
          'accept-language' : 'en-US,en;',
          'user-agent'      : 'Whatever'
        },
        token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0MjQ5NDYzNTUsImV4cCI6MTQyNDk0OTk1NX0.yHwrWnY2kqoP9aYiZMqLrHKAeJ4Ff0xHsAzXmta9J08';

      // empty auth header
      headers.authorization = '';
      expect( jwtAuth.fetch(headers) ).to.be.null;

      // auth header with a wrong structure
      headers.authorization = '123 456 789';
      expect( jwtAuth.fetch(headers) ).to.be.null;

      // auth header with a wrong structure
      headers.authorization = token;
      expect( jwtAuth.fetch(headers) ).to.be.null;

      // well formed auth header
      headers.authorization = 'Bearer ' + token;
      expect( jwtAuth.fetch(headers) ).to.equal(token);

      done();
    });

  });


  describe('create', function() {

    it('should return an error if no user is supplied', function(done) {

      var
        user = {},
        req  = {},
        res = {};

      jwtAuth.create(user, req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });


    it('should attach to the request object an user object with its data and the token when the user is supplied', function(done) {

      var
        user = {
          id      : '0123456789',
          username : 'username',
          name     : 'name',
          email    : 'user@domain.tld'
        },
        req  = {},
        res = {};


      jwtAuth.create(user, req, res, function(err) {
        expect(err).to.be.undefined;
        expect(req).to.have.property('user');

        expect(req.user.userId).to.equal(user.id);
        expect(req.user.username).to.equal(user.username);
        expect(req.user.name).to.equal(user.name);
        expect(req.user.email).to.equal(user.email);

        expect(req.user).to.have.property('token');
        expect(req.user).to.have.property('token_exp');
        expect(req.user).to.have.property('token_iat');
        done();
      });
    });


    it('should store the token on redis', function(done) {

      var
        user = {
          id      : '0123456789',
          username : 'username',
          name     : 'name',
          email    : 'user@domain.tld'
        },
        req  = {},
        res = {};

      jwtAuth.create(user, req, res, function(err) {

        jwtAuth.retrieve(req.user.token, function(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.an('object');
          expect(data.userId).to.equal(user.id);
          expect(data.username).to.equal(user.username);
          done();
        });
      });
    });

  });


  describe('retrieve', function() {

    var reqUser;

    before(function(done) {
      this.timeout(10000);

      // store something to redis (in fact redis is mocked,
      // so this happens on memory)
      var
        user = {
          id      : '0123456789',
          username : 'username',
          name     : 'name',
          email    : 'user@domain.tld'
        },
        req  = {},
        res = {};

      jwtAuth.create(user, req, res, function(err) {
        reqUser = req.user;
        done();
      });
    });


    it('should return an error if no token id is supplied', function(done) {
      jwtAuth.retrieve(null, function(err, data) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });


    it('should return an error if the token does not exist or has expired', function(done) {
      jwtAuth.retrieve('0123456789', function(err, data) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });


    it('should return the user info if previously saved', function(done) {
      jwtAuth.retrieve(reqUser.token, function(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.an('object');
        expect(data).to.have.property('userId');
        expect(data).to.have.property('username');
        expect(data).to.have.property('token');
        done();
      });

    });

  });


  describe('verify', function() {

    var reqUser;

    before(function(done) {
      this.timeout(10000);

      // It looks like redis-mock has some bug that causes
      // elements to not get destroyed when calling expire.
      // So in this test use the reral redis lib, not the mock;
      unmockRedis();

      // the lib must be reloaded
      jwtAuth = requireHelper('lib/jwtAuth');

      var
        user = {
          id       : '0123456789',
          username : 'username',
          name     : 'name',
          email    : 'user@domain.tld'
        },
        req  = {},
        res = {};

      jwtAuth.create(user, req, res, function(err) {
        reqUser = req.user;
        done();
      });
    });


    after(function(done) {
      mockRedis();
      done();
    });


    it('should verify a valid token', function(done) {
      var
        req = {
          headers : {
            authorization : 'Bearer ' + reqUser.token
          }
        },
        res = {};

      jwtAuth.verify(req, res, function(err) {
        expect(err).to.be.undefined;
        done();
      });
    });


    it('should return an error if the token is not valid or has expired', function(done) {
      var
        headers = {
          authorization : 'Bearer ' + reqUser.token
        },
        req = {
          headers : headers
        },
        res = {};

      jwtAuth.expire(headers);
      jwtAuth.verify(req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

  });


  describe('expire', function() {

    var reqUser;

    before(function(done) {
      this.timeout(10000);

      // It looks like redis-mock has some bug that causes
      // elements to not get destroyed when calling expire.
      // So in this test use the reral redis lib, not the mock;
      unmockRedis();

      var
        user = {
          id      : '0123456789',
          username : 'username',
          name     : 'name',
          email    : 'user@domain.tld'
        },
        req  = {},
        res = {};

      jwtAuth.create(user, req, res, function(err) {
        reqUser = req.user;
        done();
      });
    });


    after(function(done) {
      mockRedis();
      done();
    });


    it('should destroy a saved token', function(done) {

      var headers = {}, result;

      // try to expire a non existing token
      expect( jwtAuth.expire(headers) ).to.be.false;

      // try to expire an existing token
      headers.authorization = 'Bearer ' + reqUser.token;
      expect( jwtAuth.expire(headers) ).to.be.true;

      jwtAuth.retrieve(reqUser.token, function(err, data) {
        expect(err).to.be.instanceOf(Error);
        done();
      });

    });

  });


  describe('middleware', function() {

    it('should expose unless', function(done) {
      var middleware = jwtAuth.middleware();
      expect(middleware).to.have.property('unless');
      expect(middleware.unless).to.be.a('function');
      done();
    });

  });

});

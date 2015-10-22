'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  request        = require('supertest'),
  objectid       = require('mongodb').ObjectID,
  requireHelper  = require('test/_util/require_helper'),

  // server
  app            = requireHelper('app').app;




describe('API authentication', function() {

  this.timeout(10000);

  var defaultUser = {
    username: 'user',
    password: 'user',
    email: 'user@demo.demo'
  };


  describe('Login', function() {
    it('Should return a JWT when supplying valid user credentials', function(done) {
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: defaultUser.password })
        .expect(200)
        .end(function(err, res) {
          var responseData = res.body.data;

          expect(objectid.isValid(responseData.userId)).to.be.true;
          expect(responseData.username).to.equal(defaultUser.username);
          expect(responseData.email).to.equal(defaultUser.email);
          expect(responseData.token_exp).to.be.a('number');
          expect(responseData.token_iat).to.be.a('number');
          expect(responseData.token).to.be.a('string');
          done();
        });
    });


    it('Should return a 401 error when supplying a valid username with a wrong password', function(done) {
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: 'whatever' })
        .expect(401)
        .end(done);
    });


    it('Should return a 401 error when supplying a non existing user credentials', function(done) {
      request(app)
        .post('/api/auth')
        .send({ username: 'nonExistingUsername', password: 'whatever' })
        .expect(401)
        .end(done);
    });


    it('Should return a 401 error if the username is not supplied', function(done) {
      request(app)
        .post('/api/auth')
        .send({ password: 'whatever' })
        .expect(401)
        .end(done);
    });


    it('Should return a 401 error if the password is not supplied', function(done) {
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username })
        .expect(401)
        .end(done);
    });
  });


  describe('Logout', function() {
    it('Should return a 401 error if no valid auth token is supplied', function(done) {
      request(app)
        .delete('/api/auth/randomStringTotallyFakeToken')
        .set('Authorization', 'Bearer randomStringTotallyFakeToken')
        .expect(401)
        .end(done);
    });


    it('Should expire the JWT', function(done) {
      // 'login' first
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: defaultUser.password })
        .expect(200)
        .end(function(err, res) {

          var token = res.body.data.token;

          // logout
          request(app)
            .delete('/api/auth/' + token)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(function(err, res) {
              // verify
              request(app)
                .get('/api/auth/' + token)
                .set('Authorization', 'Bearer ' + token)
                .expect(401)
                .end(done);

            });
        });
    });


    it('Should return a 401 error the JWT is already expired', function(done) {
      // 'login' first
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: defaultUser.password })
        .expect(200)
        .end(function(err, res) {

          var token = res.body.data.token;

          // logout
          request(app)
            .delete('/api/auth/' + token)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(function(err, res) {
              // logout again
              request(app)
                .delete('/api/auth/' + token)
                .set('Authorization', 'Bearer ' + token)
                .expect(401)
                .end(done);

            });
        });
    });
  });


  describe('Verify', function() {
    it('Should return a success message if a valid JWT is supplied', function(done) {
      // 'login' first
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: defaultUser.password })
        .expect(200)
        .end(function(err, res) {

          var token = res.body.data.token;

          // verify
          request(app)
            .get('/api/auth/' + token)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(done);

        });
    });


    it('Should return a 401 if a non valid JWT is supplied', function(done) {
      request(app)
        .get('/api/auth/randomStringTotallyFakeToken')
        .set('Authorization', 'Bearer randomStringTotallyFakeToken')
        .expect(401)
        .end(done);
    });
  });


  describe('Token-refresh', function() {

    var tokenAboutToExpire = { token: null, exp: null };

    before(function(done) {
      request(app)
        .post('/api/auth')
        .send({ username: defaultUser.username, password: defaultUser.password })
        .end(function(err, res) {
          tokenAboutToExpire.token = res.body.data.token;
          tokenAboutToExpire.exp   = res.body.data.token_exp;
          done();
        });
    });


    it('Should return a 401 if thre\'s no auth header', function(done) {
      request(app)
        .put('/api/auth/randomStringTotallyFakeToken')
        .expect(401)
        .end(done);
    });


    it('Should return a 401 if the supplied token is not valid or has expired', function(done) {
      request(app)
        .put('/api/auth/randomStringTotallyFakeToken')
        .set('Authorization', 'Bearer randomStringTotallyFakeToken')
        .expect(401)
        .end(done);
    });


    it('Should issue a new token with a new expiry date', function(done) {
      this.timeout(50000);

      setTimeout(function () {

        request(app)
        .put('/api/auth/' + tokenAboutToExpire.token)
        .set('Authorization', 'Bearer ' + tokenAboutToExpire.token)
        .expect(200)
        .end(function(err, res) {
          var
            responseData = res.body.data,
            token        = responseData.token;

          expect(objectid.isValid(responseData.userId)).to.be.true;
          expect(responseData.username).to.equal(defaultUser.username);
          expect(responseData.email).to.equal(defaultUser.email);
          expect(responseData.token_exp).to.be.a('number');
          expect(responseData.token_iat).to.be.a('number');
          expect(token).to.be.a('string');

          expect(token).to.not.equal(tokenAboutToExpire.token);
          expect(responseData.token_exp).to.be.at.least(tokenAboutToExpire.exp);

          request(app)
            .get('/api/auth/' + token)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(done);
        });

      }, 2000);
    });


    it('Should expire the old token when renewing it', function(done) {
      request(app)
        .get('/api/auth/' + tokenAboutToExpire.token)
        .set('Authorization', 'Bearer ' + tokenAboutToExpire.token)
        .expect(401)
        .end(done);
    });
  });

});

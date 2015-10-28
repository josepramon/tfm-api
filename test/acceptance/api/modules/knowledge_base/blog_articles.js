// 'use strict';
//
// var
//   // test dependencies
//   mocha          = require('mocha'),
//   expect         = require('chai').expect,
//   request        = require('supertest'),
//   _              = require('underscore'),
//   requireHelper  = require('test/_util/require_helper'),
//
//   // server
//   app            = requireHelper('app').app;
//
// 
//
//
// describe('api/blog/articles', function() {
//
//   /**
//    * References to some of the API models,
//    * reused on some tests
//    * @type {Object}
//    */
//   var firstRecord, createdModel, deletedModel;
//
//
//   /**
//    * Aux. method to check the node attributes returned by the CRUD operations
//    * @param  {Object}  obj json node returned by the API
//    */
//   var isValidArticleObject = function(obj) {
//
//     expect(obj).to.be.an('object');
//
//     expect(obj).to.have.property('id');
//     expect(obj).to.have.property('title');
//     expect(obj).to.have.property('body');
//     expect(obj).to.have.property('author');
//
//     expect(obj.id).not.to.be.null;
//   };
//
//
//   /*
//    * Get the token before the tests
//    */
//   var authHeader = null;
//
//   before(function(done) {
//     request(app)
//       .post('/api/auth')
//       .set('Accept', 'application/json')
//       .send({ username: 'admin', password: 'admin1234' })
//       .end(function(err, res) {
//         authHeader = 'Bearer ' + res.body.data.token;
//         done();
//       });
//   });
//
//
//   // -- GET ALL ---------------------------------
//
//   describe('Get all article objects -> GET /api/blog/articles', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .get('/api/blog/articles')
//         .expect('Content-Type', /application\/json/)
//         .expect(401)
//         .end(function(err, res) {
//           expect(res.body).to.have.property('error');
//           expect(res.body.error).to.have.property('code');
//           expect(res.body.error.code).to.equal(401);
//           expect(res.body.error).to.have.property('message');
//           done();
//         });
//     });
//
//
//     it('should return an array of article objects', function(done) {
//       request(app)
//         .get('/api/blog/articles')
//         .set('Authorization', authHeader)
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//           var responseData = res.body.data;
//
//           expect(err).to.not.exist;
//
//           expect(_.isArray(responseData)).to.be.true;
//
//           expect(responseData).to.have.length.of.at.least(2);
//
//           // save a reference for later usage
//           firstRecord = responseData[0];
//
//           // check the node attributes
//           isValidArticleObject(firstRecord);
//
//           done();
//         });
//     });
//   });
//
//
//   // -- GET ONE ---------------------------------
//
//   describe('Get one article object -> GET /api/blog/articles/:id', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .get('/api/blog/articles/'+firstRecord.id)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .get('/api/blog/articles/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('returns an Article object', function(done) {
//       request(app)
//         .get('/api/blog/articles/'+firstRecord.id)
//         .set('Authorization', authHeader)
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           expect(err).to.not.exist;
//
//           // check the node attributes
//           isValidArticleObject(res.body.data);
//
//           done();
//         });
//     });
//
//   });
//
//
//   // -- CREATE ----------------------------------
//
//   describe('Create a new article object -> POST /api/blog/articles', function() {
//
//     var getModelObject = function() {
//       return {
//         title     : 'AAA',
//         body      : 'BBB',
//         author_id : '000000000000000000000001',
//       };
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       var obj = getModelObject();
//
//       request(app)
//         .post('/api/blog/articles/')
//         .send(obj)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return the created object', function(done) {
//
//       var obj = getModelObject();
//
//       request(app)
//         .post('/api/blog/articles/')
//         .set('Authorization', authHeader)
//         .send(obj)
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           expect(err).to.not.exist;
//
//           // save the reference for the next test
//           createdModel = res.body.data;
//
//           // check the node attributes
//           isValidArticleObject(createdModel);
//
//           expect(createdModel.title).to.equal(obj.title);
//           expect(createdModel.body).to.equal(obj.body);
//
//           done();
//         });
//     });
//
//
//     it('should persist the created object', function(done) {
//       request(app)
//         .get('/api/blog/articles/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .end(function(err, res) {
//           expect(res.body.data.id).to.equal(createdModel.id);
//           done();
//         });
//     });
//
//   });
//
//
//   // -- UPDATE ----------------------------------
//
//   describe('Update an article object -> PUT /api/blog/articles/:id', function() {
//
//     var newAttrs = {
//       title     : 'CCC',
//       slug      : 'CCC',
//       body      : 'DDD',
//       author_id : '000000000000000000000001'
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .put('/api/blog/articles/'+createdModel.id)
//         .send(newAttrs)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .put('/api/blog/articles/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return a 404 error if the model id is not valid', function(done) {
//       request(app)
//         .put('/api/blog/articles/XD')
//         .set('Authorization', authHeader)
//         .expect(404)
//         .end(function(err, res) {
//           expect(res.body).to.have.property('error');
//           expect(res.body.error).to.have.property('code');
//           expect(res.body.error.code).to.equal(404);
//           done();
//         });
//     });
//
//
//     it('should return a validation error if the request params are not valid', function(done) {
//       request(app)
//         .put('/api/blog/articles/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send({
//           title     : '',
//           author_id : 'XD',
//         })
//         .set('Accept', 'application/json')
//         .expect('Content-Type', /application\/json/)
//         .expect(422)
//         .end(function(err, res) {
//
//           var response = res.body;
//           expect(response).to.have.property('error');
//           expect(response.error.code).to.equal(422);
//           expect(response).to.have.property('errors');
//           expect(response.errors).to.have.property('title');
//           expect(response.errors).to.have.property('author');
//
//           done();
//         });
//     });
//
//
//     it('should return the modified model', function(done) {
//       request(app)
//         .put('/api/blog/articles/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send(newAttrs)
//         .set('Accept', 'application/json')
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           var model = res.body.data;
//
//           // check the node attributes
//           isValidArticleObject(model);
//
//           expect(model.title).to.equal(newAttrs.title);
//           expect(model.body).to.equal(newAttrs.body);
//
//           done();
//         });
//     });
//
//   });
//
//
//   // -- PATCH ----------------------------------
//
//   describe('Partially update an article object -> PATCH /api/blog/articles/:id', function() {
//
//     var newAttrs = {
//       title : 'DDD',
//       body  : 'EEE'
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .patch('/api/blog/articles/'+createdModel.id)
//         .send(newAttrs)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .patch('/api/blog/articles/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return a 404 error if the model id is not valid', function(done) {
//       request(app)
//         .patch('/api/blog/articles/XD')
//         .set('Authorization', authHeader)
//         .expect(404)
//         .end(function(err, res) {
//           expect(res.body).to.have.property('error');
//           expect(res.body.error).to.have.property('code');
//           expect(res.body.error.code).to.equal(404);
//           done();
//         });
//     });
//
//
//     it('should return a validation error if the request params are not valid', function(done) {
//       request(app)
//         .patch('/api/blog/articles/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send({
//           title     : '',
//           author_id : 'XD',
//         })
//         .set('Accept', 'application/json')
//         .expect('Content-Type', /application\/json/)
//         .expect(422)
//         .end(function(err, res) {
//
//           var response = res.body;
//           expect(response).to.have.property('error');
//           expect(response.error.code).to.equal(422);
//           expect(response).to.have.property('errors');
//           expect(response.errors).to.have.property('title');
//           expect(response.errors).to.have.property('author');
//
//           done();
//         });
//     });
//
//
//     it('should return the modified model', function(done) {
//       request(app)
//         .patch('/api/blog/articles/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send(newAttrs)
//         .set('Accept', 'application/json')
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           var model = res.body.data;
//
//           // check the node attributes
//           isValidArticleObject(model);
//
//           expect(model.title).to.equal(newAttrs.title);
//           expect(model.body).to.equal(newAttrs.body);
//
//           done();
//         });
//     });
//
//   });
//
//
//   // -- DELETE ----------------------------------
//
//   describe('Delete an article object -> DELETE /api/blog/articles/:id', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .delete('/api/blog/articles/'+firstRecord.id)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should retun a 404 error if the model does not exist', function(done) {
//       request(app)
//         .delete('/api/blog/articles/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return the deleted model', function(done) {
//       request(app)
//         .delete('/api/blog/articles/'+firstRecord.id)
//         .set('Authorization', authHeader)
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           expect(err).to.not.exist;
//
//           deletedModel = res.body.data;
//
//           // check the node attributes
//           isValidArticleObject(deletedModel);
//
//           done();
//         });
//     });
//
//
//     it('should delete the requested model', function(done) {
//       request(app)
//         .get('/api/blog/articles/'+deletedModel.id)
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//   });
//
//
// });

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
// describe('api/blog/tags', function() {
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
//   var isValidTagObject = function(obj) {
//
//     expect(obj).to.be.an('object');
//
//     expect(obj).to.have.property('id');
//     expect(obj).to.have.property('name');
//     expect(obj).to.have.property('slug');
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
//       .send({ username: 'admin', password: 'admin' })
//       .end(function(err, res) {
//         authHeader = 'Bearer ' + res.body.data.token;
//         done();
//       });
//   });
//
//
//   // -- GET ALL ---------------------------------
//
//   describe('Get all tag objects -> GET /api/blog/tags', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .get('/api/blog/tags')
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
//     it('should return an array of tags objects', function(done) {
//       request(app)
//         .get('/api/blog/tags')
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
//           isValidTagObject(firstRecord);
//
//           done();
//         });
//     });
//   });
//
//
//   // -- GET ONE ---------------------------------
//
//   describe('Get one tag object -> GET /api/blog/tags/:id', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .get('/api/blog/tags/'+firstRecord.id)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .get('/api/blog/tags/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('returns an Tag object', function(done) {
//       request(app)
//         .get('/api/blog/tags/'+firstRecord.id)
//         .set('Authorization', authHeader)
//         .expect('Content-Type', /application\/json/)
//         .expect(200)
//         .end(function(err, res) {
//
//           expect(err).to.not.exist;
//
//           // check the node attributes
//           isValidTagObject(res.body.data);
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
//   describe('Create a new tag object -> POST /api/blog/tags', function() {
//
//     var getModelObject = function() {
//       return {
//         name        : 'AAA',
//         description : 'XD'
//       };
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       var obj = getModelObject();
//
//       request(app)
//         .post('/api/blog/tags/')
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
//         .post('/api/blog/tags/')
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
//           isValidTagObject(createdModel);
//
//           expect(createdModel.name).to.equal(obj.name);
//           expect(createdModel.description).to.equal(obj.description);
//
//           done();
//         });
//     });
//
//
//     it('should persist the created object', function(done) {
//       request(app)
//         .get('/api/blog/tags/'+createdModel.id)
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
//   describe('Update a tag object -> PUT /api/blog/tags/:id', function() {
//
//     var newAttrs = {
//       name        : 'CCCCCC',
//       slug        : 'CCCCCC',
//       description : 'XXXXXX'
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .put('/api/blog/tags/'+createdModel.id)
//         .send(newAttrs)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .put('/api/blog/tags/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return a 404 error if the model id is not valid', function(done) {
//       request(app)
//         .put('/api/blog/tags/XD')
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
//         .put('/api/blog/tags/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send({
//           name : ''
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
//           expect(response.errors).to.have.property('name');
//
//           done();
//         });
//     });
//
//
//     it('should return the modified model', function(done) {
//       request(app)
//         .put('/api/blog/tags/'+createdModel.id)
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
//           isValidTagObject(model);
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
//   describe('Update a tag object -> PUT /api/blog/tags/:id', function() {
//
//     var newAttrs = {
//       name : 'DDDDDD'
//     };
//
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .patch('/api/blog/tags/'+createdModel.id)
//         .send(newAttrs)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .patch('/api/blog/tags/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return a 404 error if the model id is not valid', function(done) {
//       request(app)
//         .patch('/api/blog/tags/XD')
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
//         .patch('/api/blog/tags/'+createdModel.id)
//         .set('Authorization', authHeader)
//         .send({
//           name : ''
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
//           expect(response.errors).to.have.property('name');
//
//           done();
//         });
//     });
//
//
//     it('should return the modified model', function(done) {
//       request(app)
//         .patch('/api/blog/tags/'+createdModel.id)
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
//           isValidTagObject(model);
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
//   describe('Delete an tag object -> DELETE /api/blog/tags/:id', function() {
//
//     it('should reject the request if there\'s no valid authorization header', function(done) {
//       request(app)
//         .delete('/api/blog/tags/'+firstRecord.id)
//         .expect('Content-Type', /application\/json/)
//         .expect(401, done);
//     });
//
//
//     it('should return a 404 error if the model does not exist', function(done) {
//       request(app)
//         .delete('/api/blog/tags/a-non-existing-record-id')
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//
//     it('should return the deleted model', function(done) {
//       request(app)
//         .delete('/api/blog/tags/'+firstRecord.id)
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
//           isValidTagObject(deletedModel);
//
//           done();
//         });
//     });
//
//
//     it('should delete the requested model', function(done) {
//       request(app)
//         .get('/api/blog/tags/'+deletedModel.id)
//         .set('Authorization', authHeader)
//         .expect(404, done);
//     });
//
//   });
//
//
// });

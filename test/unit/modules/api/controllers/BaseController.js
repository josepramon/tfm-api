'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  sinon          = require('sinon'),
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  BaseController = requireHelper('modules/api/controllers/BaseController');

describe('BaseController', function() {

  it('should implement the CRUD methods', function(done) {
    var c = new BaseController();

    expect(typeof c.getOne).to.equal('function');
    expect(typeof c.getAll).to.equal('function');
    expect(typeof c.create).to.equal('function');
    expect(typeof c.update).to.equal('function');
    expect(typeof c.delete).to.equal('function');
    done();
  });


  it('should implement an asyncronous "create" method', function(done) {
    (new BaseController()).create(null, null, done);
  });


  it('should implement an asyncronous "update" method', function(done) {
    (new BaseController()).update(null, null, done);
  });


  describe('updatePartial', function() {
    it('should implement an asyncronous "updatePartial" method', function(done) {
      (new BaseController()).updatePartial(null, null, done);
    });

    it('should call "update" with an additional parameter', function(done) {
      var controller = new BaseController();
      var spy = sinon.spy(controller, 'update');

      var callback = function() {
        expect(spy.calledWithExactly(null, null, callback, true)).to.be.true;
        done();
      };

      controller.updatePartial(null, null, callback);
    });
  });


  describe('_buildCriteria', function() {

    var request;

    before(function(done) {
      // mock the request
      request = {
        req: {
          params: {}
        },
        getOwnerFromAuth() { return 1; }
      };
      done();
    });


    it('should return an object with an "owner" key', function(done) {
      var controller = new BaseController();

      var criteria = controller._buildCriteria(request);
      expect(criteria).to.have.property('owner');
      expect(criteria.owner).to.equal(1);
      done();
    });


    it('should return an object with an "_id" key if there is an "id" request parameter', function(done) {
      var controller = new BaseController();
      request.req.params.id = 1;

      var criteria = controller._buildCriteria(request);
      expect(criteria).to.have.property('_id');
      expect(criteria._id).to.equal(1);
      done();
    });

  });


  describe('_getAssignableAttributes', function() {

    var request, model;

    before(function(done) {
      // mock the request
      request = {
        req: {
          body: {
            bar: 'bar',
            baz: 'baz'
          },
          user: {
            userId: 1
          }
        }
      };

      // mock the model
      model = {
        safeAttrs: ['foo', 'bar']
      };

      done();
    });


    it('should return the model safe attributes filled with the received values or empty if not set', function(done) {
      var controller = new BaseController();
      controller.Model = model;

      expect(controller._getAssignableAttributes(request)).to.deep.equal({
        owner: 1,
        foo: undefined,
        bar: 'bar'
      });
      done();
    });


    it('should return ONLY the model safe attributes filled with the received values', function(done) {
      var controller = new BaseController();
      controller.Model = model;

      expect(controller._getAssignableAttributes(request, true)).to.deep.equal({
        owner: 1,
        bar: 'bar'
      });
      done();
    });

  });

});

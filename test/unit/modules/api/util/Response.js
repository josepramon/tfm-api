'use strict';

var
  _               = require('underscore'),

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  sinon           = require('sinon'),
  requireHelper   = require('test/_util/require_helper'),

  // other
  ExpandsURLMap   = require('src/modules/api/util/ExpandsURLMap'),

  // file to test
  Response = requireHelper('modules/api/util/Response');


describe('modules/api/util/Response', function() {

  var model, spy;

  before(function(done) {
    // mock the model
    var constr = {
      deepPopulate : function(data, paths, populationOpts, callback) {
        callback(null, data);
      }
    };

    spy = sinon.spy(constr, 'deepPopulate');
    model = { constructor: constr };
    done();
  });


  beforeEach(function(done) {
    spy.reset();
    done();
  });


  it('should allow setting the pagination params', function(done) {
    var response = new Response(null, new ExpandsURLMap());
    var
      pageCount = 4,
      itemCount = 20;

    var resp = response.setPaginationParams(pageCount, itemCount);

    // the method is chainable (it returns the instance)
    expect(response).to.deep.equal(resp);

    expect(response).to.have.property('paginationParams');
    expect(response.paginationParams).to.not.be.null;

    expect(response.paginationParams.pageCount).to.equal(pageCount);
    expect(response.paginationParams.itemCount).to.equal(itemCount);

    done();
  });


  it('should format the response', function(done) {
    // mock the request obj
    var request = {
      getExpands: function() { return ['a', 'b']; }
    };

    var response = new Response(request, new ExpandsURLMap());

    response.formatOutput(model, function(error, formattedOutput) {
      expect(error).to.be.null;
      expect(formattedOutput).to.have.property('meta');
      expect(formattedOutput).to.have.property('data');
      done();
    });
  });


  describe('_expandData', function() {

    it('should accept a single model', function(done) {
      var response = new Response();
      response._expandData(model,{foo:{}}, function(err, data) {
        expect(err).to.be.null;
        expect(spy.called).to.be.true;
        done();
      });
    });


    it('should accept a an empty array', function(done) {
      var response = new Response();
      response._expandData([],{foo:{}}, function(err, data) {
        expect(err).to.be.null;
        expect(spy.called).to.be.false;
        done();
      });
    });


    it('should accept a an array of models', function(done) {
      var response = new Response();
      response._expandData([model, model],{foo:{}}, function(err, data) {
        expect(err).to.be.null;
        expect(spy.called).to.be.true;
        done();
      });
    });


    it('should not call the `deepPopulate` method on the model if there are no expands', function(done) {
      var response = new Response();
      response._expandData([],{}, function(err, data) {
        expect(err).to.be.null;
        expect(spy.called).to.be.false;
        done();
      });
    });

  });

});

'use strict';

var
  _               = require('underscore'),
  objectid        = require('mongodb').ObjectID,

  // test dependencies
  mocha           = require('mocha'),
  expect          = require('chai').expect,
  requireHelper   = require('test/_util/require_helper'),

  // file to test
  ExpandsURLMap = requireHelper('modules/api/util/ExpandsURLMap');


describe('modules/api/util/ExpandsURLMap', function() {

  it('should store the data passed on the constructor as an attribute', function(done) {
    var data = {
      "foo": {
        "route": "/foo/:itemId"
      }
    };

    var instance = new ExpandsURLMap(data);

    expect(instance.data).to.deep.equal(data);

    done();
  });


  it('should return the expands depth', function(done) {

    var instance = new ExpandsURLMap(null);

    expect(instance.depth).to.equal(1);

    instance = new ExpandsURLMap({
      "foo": {
        "route": "/foo/:itemId"
      }
    });

    expect(instance.depth).to.equal(1);

    instance = new ExpandsURLMap({
      "foo": {
        "route": "/foo/:itemId"
      },
      "bar": {
        "route": "/bar/:itemId",
        "expands": {
          "baz": {
            "route": "/baz/:itemId"
          }
        }
      }
    });

    expect(instance.depth).to.equal(2);

    done();
  });


  it('should return the route for a requested path', function(done) {
    var data = {
      "foo": {
        "route": "/foo/:itemId"
      },
      "bar": {
        "route": "/bar/:itemId",
        "expands": {
          "baz": {
            "route": "/baz/:itemId"
          }
        }
      }
    };

    var instance = new ExpandsURLMap(data);

    expect(instance.getRoute('foo')).to.equal(data.foo.route);
    expect(instance.getRoute('bar')).to.equal(data.bar.route);
    expect(instance.getRoute('bar/baz')).to.equal(data.bar.expands.baz.route);
    expect(instance.getRoute('xxx')).to.be.null;
    expect(instance.getRoute()).to.be.null;

    done();
  });

});

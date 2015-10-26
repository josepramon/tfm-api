'use strict';

var
  _              = require('underscore'),

  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  mailer         = requireHelper('lib/mailer');



describe('lib/mailer', function() {

  it('should expose a defaults object', function(done) {
    var defaults = mailer.getDefaults();
    expect(defaults).to.deep.equal({});
    done();
  });


  it('should persist assigned defaults', function(done) {
    var customDefaults = { foo: 1 };

    mailer.setDefaults(customDefaults);

    var defaults = mailer.getDefaults();
    expect(defaults).to.deep.equal(customDefaults);
    done();
  });


  it('should invoke a callback when calling sedmail', function(done) {
    mailer.send({}, function(error, info) {
      // don't check if it has been sent
      // this is a test and provably the system can't send mails
      done();
    });
  });

});

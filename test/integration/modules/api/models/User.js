'use strict';

var
  db                = require('test/_util/db'),

  // test dependencies
  mocha             = require('mocha'),
  expect            = require('chai').expect,
  faker             = require('faker'),
  requireHelper     = require('test/_util/require_helper'),
  Role              = require('src/modules/api/models/Role'),

  // file being tested
  User              = requireHelper('modules/api/models/User');




describe('User model', function() {

  var roles = [{}];

  this.timeout(10000);

  before(function(done) {
    db.connect(function() {
      // retrieve the roles
      Role.find({}, function(err, userRoles) {
        roles = userRoles;

        // make sure the indexes are ready
        // (mongoose creates them on the go)
        User.ensureIndexes(function (err) {
          if (err) { return done(err); }
          done();
        });
      });
    });

  });


  after(function(done) {
    db.disconnect(done);
  });


  it('should save the user', function(done) {
    var userdata = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email:    faker.internet.email().toLowerCase(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      if(err) { done(err); }
      expect(user.username).to.equal(userdata.username);
      expect(user.email).to.equal(userdata.email);
      user.remove();
      done();
    });
  });


  it('should transform the virtual attributes when /saving/fetching', function(done) {
    var userdata = {
      id :      '000000000000000000000001',
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email:    faker.internet.email().toLowerCase(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      var userJSON = user.toJSON();
      expect(userJSON).to.have.property('id');
      expect(userJSON).to.not.have.property('_id');
      expect(userJSON).to.not.have.property('password');
      user.remove();

      done();
    });

  });


  it('should store the password encrypted', function(done) {
    var userdata = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email:    faker.internet.email().toLowerCase(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    // user is new
    user.save(function(err, user) {
      if(err) { done(err); }
      expect(user.password).to.not.equal(userdata.password);
      user.comparePassword(userdata.password, function(err, match) {
        expect(match).to.true;
      });

      // editing an existing user, assign a new password
      var newPassword = faker.internet.password() + '1234';
      user.password = newPassword;

      user.save(function(err, user) {
        if(err) { done(err); }
        expect(user.password).to.not.equal(newPassword);

        user.comparePassword(newPassword, function(err, match) {
          expect(match).to.true;
        });

        user.remove();

        done();
      });
    });
  });


  it('should require a username', function(done) {
    var userdata = {
      password: faker.internet.password(),
      email:    faker.internet.email().toLowerCase(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      if(err) {
        expect(err.errors).to.have.property('username');
        done();
      } else {
        user.remove();
        done(new Error('Model saved successfully'));
      }
    });
  });


  it('should require a email', function(done) {
    var userdata = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      if(err) {
        expect(err.errors).to.have.property('email');
        done();
      } else {
        user.remove();
        done(new Error('Model saved successfully'));
      }
    });
  });


  it('should require a password', function(done) {
    var userdata = {
      username: faker.internet.userName(),
      email:    faker.internet.email().toLowerCase(),
      role:     roles[0].id
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      if(err) {
        expect(err.errors).to.have.property('password');
        done();
      } else {
        user.remove();
        done(new Error('Model saved successfully'));
      }
    });
  });


  it('should require a role', function(done) {
    var userdata = {
      username: faker.internet.userName(),
      email:    faker.internet.email().toLowerCase()
    };

    var user = new User(userdata);

    user.save(function(err, user) {
      if(err) {
        expect(err.errors).to.have.property('role');
        done();
      } else {
        user.remove();
        done(new Error('Model saved successfully'));
      }
    });
  });


  it('should require a unique username', function(done) {
    var
      userdata = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email:    faker.internet.email().toLowerCase(),
        role:     roles[0].id
      },
      user1 = new User(userdata),
      user2 = new User(userdata);

    user1.save(function(err, user) {
      if(err) { done(err); }

      user2.save(function(err, user) {
        if(err) {
          user1.remove();
          done();
        } else {
          user1.remove();
          user2.remove();
          done(new Error('Model saved successfully'));
        }
      });
    });
  });

});

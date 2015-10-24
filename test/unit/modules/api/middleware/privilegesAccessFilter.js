'use strict';

var
  // test dependencies
  mocha          = require('mocha'),
  expect         = require('chai').expect,
  requireHelper  = require('test/_util/require_helper'),

  // file to test
  privilegesLib = requireHelper('modules/api/middleware/privilegesAccessFilter');


describe('privilegesAccessFilter', function() {

  it('should determine if the access is granted comparing the `actions` nodes', function(done) {

    var requiredActions, userActions, result;

    requiredActions = null;
    userActions     = null;
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {};
    userActions     = null;
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {};
    userActions     = {};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {};
    userActions     = {foo: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true};
    userActions     = {};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.false;

    requiredActions = {foo: true};
    userActions     = {foo: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true};
    userActions     = {foo: true, bar: false};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true, bar: false};
    userActions     = {foo: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true, bar: false};
    userActions     = {foo: true, bar: false};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true, bar: true};
    userActions     = {foo: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.false;

    requiredActions = {foo: true};
    userActions     = {foo: true, bar: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.true;

    requiredActions = {foo: true, bar: true};
    userActions     = {bar: true};
    result = privilegesLib._isActionsAllowed(requiredActions, userActions);
    expect(result).to.be.false;

    done();
  });


  it('should determine if the access is granted comparing the entire privileges object', function(done) {

    var requiredPermissions, userPermissions, result;

    requiredPermissions = null;
    userPermissions     = null;
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {};
    userPermissions     = {};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {};
    userPermissions     = null;
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = null;
    userPermissions     = {};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {foo: true};
    userPermissions     = {};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {};
    userPermissions     = {foo: true};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {foo: true, bar: true};
    userPermissions     = {foo: true};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {foo: true};
    userPermissions     = {foo: true, bar: true};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {foo: true, bar: true};
    userPermissions     = {bar: true};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        baz: true
      }
    };
    userPermissions     = {foo: true, bar: true};
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {
      foo: true,
      bar: {
        baz: true
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        baz: true
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true,
          qux: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true,
          qux: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {
      foo: false
    };
    userPermissions = {
      foo: true
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true
    };
    userPermissions = {
      foo: false
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: {
            actions: {
              foo: true
            }
          }
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: {
            actions: {
              foo: true
            }
          }
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: {
            actions: {
              foo: true
            }
          }
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    requiredPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: {
            actions: {
              foo: true
            }
          }
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: false
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        actions: {
          foo: true
        },
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        actions: {
          foo: true,
          bar: true
        },
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        actions: {
          foo: true
        },
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.false;

    requiredPermissions = {
      foo: true,
      bar: {
        actions: {
          foo: true
        },
        modules: {
          baz: true
        }
      }
    };
    userPermissions = {
      foo: true,
      bar: {
        actions: {
          foo: true,
          bar: true
        },
        modules: {
          baz: true
        }
      }
    };
    result = privilegesLib._isAllowed(requiredPermissions, userPermissions);
    expect(result).to.be.true;

    done();
  });


  describe('middleware', function(done) {

    it('should call the next action if no privileges are required', function(done) {
      var
        permissions = null,
        request     = {},
        response    = {};

      privilegesLib.middleware(permissions, request, response, function(err) {
        expect(err).to.be.undefined;
        done();
      });
    });

    it('should return an error if there is no user details on the request', function(done) {
      var
        permissions = {foo: true},
        request     = {},
        response    = {};

      privilegesLib.middleware(permissions, request, response, function(err) {
        expect(err).not.to.be.undefined;
        expect(err).to.have.property('code');
        expect(err.code).to.equal(401);
        done();
      });
    });

    it('should return an error if the user does not have a privileges hash', function(done) {
      var
        permissions = {foo: true},
        request     = {user: {}},
        response    = {};

      privilegesLib.middleware(permissions, request, response, function(err) {
        expect(err).not.to.be.undefined;
        expect(err).to.have.property('code');
        expect(err.code).to.equal(401);
        done();
      });
    });

    it('should return an error if the user privileges do not match the required ones', function(done) {
      var
        permissions = {foo: true},
        request     = {user: {
          privileges: {
            bar: true
          }
        }},
        response    = {};

      privilegesLib.middleware(permissions, request, response, function(err) {
        expect(err).not.to.be.undefined;
        expect(err).to.have.property('code');
        expect(err.code).to.equal(401);
        done();
      });
    });

    it('should call the next action if the requested privileges are matched', function(done) {
      var
        permissions = {foo: true},
        request     = {user: {
          privileges: {
            foo: true
          }
        }},
        response    = {};

      privilegesLib.middleware(permissions, request, response, function(err) {
        expect(err).to.be.undefined;
        done();
      });
    });

  });
});

var
  _                   = require('underscore'),
  fs                  = require('fs'),
  debug               = require('debug')('ApiApp:config' + process.pid);


var loadJsonSync = function(path) {
  var ret = {};

  try {

    var stat = fs.statSync(path);

    /* istanbul ignore next */
    if(stat.isFile()) {
      var content = fs.readFileSync(path, 'utf8');
      ret = JSON.parse(content);
    }

  } catch(e) {
    debug(path + ' does not exist', e);
  }

  return ret;
};


/**
 * Application settings loading:
 *
 * Parse the defaults and custom overrides
 */
var
  defaultSettingsFile = __dirname + '/../../env.default.json',
  customSettingsFile  = __dirname + '/../../env.json',

  defaultSettings = loadJsonSync(defaultSettingsFile),
  customSettings  = loadJsonSync(customSettingsFile);



module.exports = _.extend({}, defaultSettings, customSettings, {

  // other application settings

  roles: {
    admin: 'ADMIN',
    agent: 'AGENT',
    user:  'USER'
  },

  pagination: {
    defaultLimit: 20,
    maxLimit:     200
  }

});

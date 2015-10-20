var
  _                   = require('underscore'),
  fs                  = require('fs'),
  debug               = require('debug')('ApiApp:config' + process.pid),
  defaultSettingsFile = __dirname + '/../../env.default.json',
  customSettingsFile  = __dirname + '/../../env.json';


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


var
  defaultSettings = loadJsonSync(defaultSettingsFile),
  customSettings  = loadJsonSync(customSettingsFile);



module.exports = _.extend({}, defaultSettings, customSettings, {
  pagination: {
    defaultLimit: 20,
    maxLimit:     200
  }
});

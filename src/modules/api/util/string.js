var _ = require('underscore');

module.exports = {

  /**
   * Custom search query scaping, to avoid conflicts with other params
   */
  _escapeMap: (function() {
    return ':;.,()[]'.split('').reduce(function(memo, k) {
      memo[k + ''] = '\\' + k.charCodeAt();
      return memo;
    }, {});
  })(),

  _escape: function(str, mapObj) {
    var re, strRe;
    strRe = _.keys(mapObj).map(function(k) {
      return '\\' + k;
    }).join('|');
    re = new RegExp(strRe, 'gi');
    return str.replace(re, (function(_this) {
      return function(match) {
        return mapObj[match.toLowerCase()];
      };
    })(this));
  },

  escapeQueryParam: function(str) {
    return this._escape(str, this._escapeMap);
  },

  unescapeQueryParam: function(str) {
    return this._escape(str, _.invert(this._escapeMap));
  }
};

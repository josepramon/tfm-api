'use strict';

var _ = require('underscore');


module.exports = {

  /**
   * Date to timestamp converter
   * @param  {Date} date
   * @return {Number}
   */
  dateToTimestamp : function(date) {
    var ret = null;

    if(_.isDate(date)) {
      ret = Math.round(date.getTime() / 1000);
    }

    return ret;
  },

  /**
   * Timestamp to date converter
   * @param  {Number} timestamp
   * @return {Date}
   */
  timestampToDate : function(timestamp) {
    var ret = null;

    if(/^\d{10}$/.test(timestamp)) {
      ret = new Date(timestamp*1000);
    }

    return ret;
  }

};

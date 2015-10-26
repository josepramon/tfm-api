'use strict';

var
  _               = require('underscore'),
  debug           = require('debug')('ApiApp:mail:' + process.pid),
  nodemailer      = require('nodemailer'),
  hbs             = require('nodemailer-express-handlebars'),
  htmlToText      = require('nodemailer-html-to-text').htmlToText,

  /**
   * Mail transport
   */
  transporter,

  /**
   * Default settings applied to all mails (any will be overrided if supplied on
   * on the data arg. when calling sendmail())
   *
   * Valid fields:
   *   - from
   *   - sender
   *   - to
   *   - cc
   *   - bcc
   *   - replyTo
   *   - inReplyTo
   *   - references
   *   - subject
   *   - text
   *   - html
   *   - watchHtml
   *   - priority
   *   - headers
   *   - attachments
   *   - alternatives
   *   - envelope
   *   - messageId
   *   - date
   *   - encoding
   *
   * @see http://nodemailer.com/#e-mail-message-fields for a description of each field
   */
  defaults = {};


/**
 * Defaults getter
 * @return {Object}
 */
var getDefaults = function() {
  return defaults;
};


/**
 * Defaults setter
 * @param {Object} newDefaults
 */
var setDefaults = function(newDefaults) {
  defaults = newDefaults;
};


/**
 * Mail transport setup
 *
 * Creates the mail transport that will be used to send the mails.
 *
 * @param  {Object} settings see http://nodemailer.com
 */
var setupMailer = function(settings) {
  settings = settings || {};

  /* istanbul ignore else */
  if(!_.keys(settings).length) {
    // empty config, so no mailing
    var stubTransport = require('nodemailer-stub-transport');
    settings = stubTransport;

  } else {

    if(settings.service === 'sendgrid') {
      var sgTransport = require('nodemailer-sendgrid-transport');
      settings = sgTransport(settings);

    } else if(settings.service === 'direct') {
      settings = undefined;

    } else if(!settings.service) {

      // no service, assume a smtp config.
      var smtpTransport = require('nodemailer-smtp-transport');
      settings = smtpTransport(settings);
    }
  }

  transporter = nodemailer.createTransport(settings);

  // attach content plugins
  transporter.use('compile', hbs({
    viewPath: 'src/modules/api/views',
    extName:  '.hbs'
  }));
  transporter.use('compile', htmlToText({}));
};


/**
 * Mail sending
 * @param  {Object}   data     see defaults
 * @param  {Function} callback callback, receives two params: error, info
 */
var sedmail = function(data, callback) {
  // merge the provided options with the defaults
  data = _.defaults(data, defaults);

  if(!transporter) {
    // for the tests
    callback(null);
  } else {
    transporter.sendMail(data, callback);
  }
};



module.exports = {
  send:        sedmail,
  setup:       setupMailer,
  getDefaults: getDefaults,
  setDefaults: setDefaults
};

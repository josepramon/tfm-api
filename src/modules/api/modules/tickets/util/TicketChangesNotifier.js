var
  apiBasePath     = '../../..',
  moduleBasePath  = '..',
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),
  config          = require('src/config'),
  mailer          = require('src/lib/mailer'),
  User            = require(apiBasePath + '/models/UserBase');


/**
 * Retrieve some user from the database (it does not matter the user type)
 */
var _getUser = function(id, callback) {

  User.findOne({_id: id}).exec(function(err, model) {

    /* istanbul ignore next */
    if (err)    { return callback(err); }
    if (!model) { return callback(new errors.NotFound()); }

    callback(null, model);
  });
};


/**
 * @return {String} the url of some of the apps (based on the user profile))
 */
var _getAppBaseUrl = function(user) {
  user = user || {};
  return (user.__t === 'User') ? config.sites.users : config.sites.admin;
};


/**
 * @return {String} the ticket url (in the appropiate app, based on the user profile)
 */
var _getTicketUrl = function(ticket, user) {
  return _getAppBaseUrl(user) + '/#tickets/' + ticket.id;
};


/**
 * @return {String} returns an id as a string (converting it fron an ObjectId if necessary)
 */
var _getIdAsString = function(id) {
  if(!id) { return null; }
  return id.toHexString ? id.toHexString() : id;
};


/**
 * Send an email to the ticket owner and assigned manager
 * @param  {Object}   user         the authenticated user
 * @param  {Ticket}   model
 * @param  {Object}   mailSettings
 * @param  {Function} callback
 */
var notify = function(user, ticket, mailSettings, callback) {
  mailSettings = mailSettings || {};

  // default settings
  var
    defaults = {
      subject:     'Ticket #'+ticket.id+' has been updated',
      template:     null,
      templateData: {}
    },
    settings = _.extend({}, defaults, mailSettings);

  // the template is mandatory
  if(!settings.template) {
    return callback('Template is required');
  }


  // Determine the user that will receive the mail:
  // In any given ticket, there're involved a user and if assigned, a manager.
  // The user that triggered the change (the one who performed the API call)
  // should not receive the notification, only the other party, if any.
  var receivers = _.chain([ticket.user, ticket.manager])
    .map(_getIdAsString)
    .compact()
    .without(user.id)
    .value();


  if(!receivers.length) {
    return callback();
  } else {

    async.each(receivers, function(userId, cb) {

      _getUser(userId, function(err, userModel) {
        /* istanbul ignore next */
        if (err) { return cb(err); }

        // template data
        var ctx = {
          ticketId:  ticket.id,
          ticketUrl: _getTicketUrl(ticket, userModel)
        };

        // set the mail parameters
        var mailData = {
          to:       userModel.email,
          subject:  settings.subject,
          template: settings.template,
          context:  _.extend({}, ctx, settings.templateData)
        };

        // send it
        mailer.send(mailData, function(err, info) {
          cb(err, userModel);
        });
      });

    }, function(err) {
      callback(err);
    });
  }

};



module.exports = {
  notify: notify,

  _getUser:       _getUser,
  _getAppBaseUrl: _getAppBaseUrl,
  _getTicketUrl:  _getTicketUrl,
  _getIdAsString: _getIdAsString
};

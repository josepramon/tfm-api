'use strict';

var
  _                      = require('lodash'),
  config                 = require('src/config'),

  PasswordRecoveryController = require('../controllers/PasswordRecoveryController'),
  controller                 = new PasswordRecoveryController();



module.exports = function(router) {

  router.route('/auth/recover')
    .post(controller.create.bind(controller));

  router.route('/auth/recover/:id')
    .put(controller.update.bind(controller))
    .patch(controller.update.bind(controller));
};

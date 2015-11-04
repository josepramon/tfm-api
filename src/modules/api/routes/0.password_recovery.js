'use strict';

var
  _                      = require('lodash'),
  config                 = require('src/config'),

  PasswordRecoveryController = require('../controllers/PasswordRecoveryController'),
  controller                 = new PasswordRecoveryController();



module.exports = function(router) {

  /**
   * @apiDefine Auth_PasswordReset
   *
   * Auth/PasswordReset
   * Password reset API endpoint
   */


  /**
   * @apiDefine Auth_PasswordReset_CommonApiResponseHeader
   *
   * @apiSuccess {Object} meta                 Response metadata
   * @apiSuccess {String} meta.url             Resource url
   *
   */


  /**
   * @api {post} /auth/recover Create a password reset request
   * @apiName Create
   * @apiGroup Auth_PasswordReset
   *
   * @apiDescription Creates a password reset requests that allows the user
   * to set a new password without providing the previous one. In order to
   * set the new password, a new request must be performed to a temporary url
   * with the new password (a mail will be sent to the user with a special
   * temporary link that will perform that API request).
   * When calling this method, either the username or the email must be provided.
   *
   *
   * @apiParam {String} [username]     Username
   * @apiParam {String} [email]        Email
   *
   * @apiExample Example usage:
   * curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=foo' http://localhost:9000/api/auth/recover
   *
   * @apiUse Auth_PasswordReset_CommonApiResponseHeader
   * @apiSuccess {Object} data      The request data
   * @apiSuccess {String} data.success  Boolean
   * @apiSuccess {String} data.message  A descriptive message
   * @apiSuccess {String} data.user     The user id
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta": {
   *         "url": "http://localhost:9000/api/auth/recover/83b3bf20-b2ad-4f6d-85c3-d43848495281"
   *       },
   *       "data": {
   *         "success": true,
   *         "message": "Password reset request created successfully",
   *         "user": "562e3b0c930b26b7755d0d76"
   *       }
   *     }
   *
   */
  router.route('/auth/recover').post(controller.create.bind(controller));

  /**
   * @api {put} /auth/recover/:id Set a new password for the user associated to the password reset request
   * @apiName Update
   * @apiGroup Auth_PasswordReset
   *
   * @apiDescription Creates a password reset requests that allows the user
   * to set a new password without providing the previous one. In order to
   * set the new password, a new request must be performed to a temporary url
   * with the new password (a mail will be sent to the user with a special
   * temporary link that will perform that API request).
   * When calling this method, either the username or the email must be provided.
   *
   *
   * @apiParam {String} password  The new password
   *
   * @apiExample Example usage:
   * curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'password=theNewPassword' http://localhost:9000/api/auth/recover/http://localhost:9000/api/auth/recover/83b3bf20-b2ad-4f6d-85c3-d43848495281"
   *
   * @apiUse Auth_PasswordReset_CommonApiResponseHeader
   * @apiSuccess {Object} data          The request data
   * @apiSuccess {String} data.success  Boolean
   * @apiSuccess {String} data.message  A descriptive message
   * @apiSuccess {String} data.user     The user id
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta": {
   *         "url": "http://localhost:9000/api/auth/recover/83b3bf20-b2ad-4f6d-85c3-d43848495281"
   *       },
   *       "data": {
   *         "success": true,
   *         "message": "Password changed successfully",
   *         "user": "562e3b0c930b26b7755d0d76"
   *       }
   *     }
   *
   */
  router.route('/auth/recover/:id').put(controller.update.bind(controller));
};

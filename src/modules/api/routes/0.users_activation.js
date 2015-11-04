'use strict';

var
  _                         = require('lodash'),
  config                    = require('src/config'),
  UsersActivationController = require('../controllers/UsersActivationController'),
  controller                = new UsersActivationController(true);



module.exports = function(router) {

  /**
   * @apiDefine Auth_Activate
   *
   * Auth/Activate
   * Accounts activation API endpoint
   */

  /**
   * @api {patch} /auth/activate/users/:id Activate an user account
   * @apiName ActivateUser
   * @apiGroup Auth_Activate
   * @apiDescription Activate an user account and set any additional details for that user (like the profile)
   *
   * @apiExample Example usage:
   * curl -X PATCH -H "Content-Type: application/x-www-form-urlencoded" 'http://localhost:9000/api/auth/activate/users/55a4fc5b356e6df4d223618e'
   *
   * @apiSuccess {Object} meta                 Response metadata
   * @apiSuccess {String} meta.url             Resource url
   * @apiSuccess {Object} data                 The User data
   * @apiSuccess {String} data.id              Id
   * @apiSuccess {String} data.username        User name
   * @apiSuccess {String} data.email           User email
   * @apiSuccess {String} data.role            User Role
   * @apiSuccess {Object} [data.profile]       User profile
   * @apiSuccess {String} data.created_at      Creation date
   * @apiSuccess {String} data.updated_at      Last update date
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta": {
   *         "url": "http://localhost:8000/api/auth/activate/users/e46e68f7-3531-42fa-8b3d-cca3856f746e"
   *       },
   *       "data": {
   *         "id": "562e18f5ea83189f4497e01a",
   *         "username": "foo",
   *         "email": "email1@domain.com",
   *         "updated_at": 1434636343,
   *         "created_at": 1434518089
   *       }
   *     }
   *
   */
  router.route('/auth/activate/users/:id').patch(controller.activate.bind(controller));

};

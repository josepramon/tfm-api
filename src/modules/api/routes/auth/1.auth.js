'use strict';

var
  moduleBasePath                  = '../..',
  authMiddleware                  = require(moduleBasePath + '/middleware/authenticate'),
  restrictByApplicationMiddleware = require(moduleBasePath + '/middleware/restrictByApplication'),
  AuthController                  = require(moduleBasePath + '/controllers/AuthController'),
  controller                      = new AuthController();


// AUTH RELATED ROUTES
// =============================================================================
module.exports = function(router) {

  /**
   * @api {post} /api/auth Login
   * @apiName Login
   * @apiGroup Auth
   * @apiDescription Authenticates the user and returns the auth token. The token
   *                 is also saved to a Redis store so it can be revoked at any time.
   *                 It returns the token data and also the user info (like the user
   *                 name, the profile, privileges and any other user info), to avoid
   *                 unnecessary additional API calls.
   *
   * @apiExample Example usage:
   * curl -4 -i -X POST http://localhost:9000/api/auth --data "username=demo&password=demo"
   *
   * @apiParam {String} username User name.
   * @apiParam {String} password User password.
   *
   * @apiSuccess {String} id User id.
   * @apiSuccess {String} username Username.
   * @apiSuccess {String} email User email.
   * @apiSuccess {String} token JWT.
   * @apiSuccess {Number} token_exp Token expiry date (Unix time).
   * @apiSuccess {Number} token_iat Token issue date (Unix time).
   * @apiSuccess {String} role      User role
   * @apiSuccess {Object} token_iat Privileges, used to determine on the frontend
   *                                apps which modules/actions the user has access
   *                                (additionally the API performs this checks on
   *                                the API endpoints)
   * @apiSuccess {Object} user      The user object (as a relation, expanded by default)
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta": {},
   *       "data": {
   *         "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NTEwZTdiNmM3NTQ3MjllY2U3YjAyYiIsImlhdCI6MTQ0ODMwMTU2NywiZXhwIjoxNDQ4MzA1MTY3fQ.WzT-WhiXwE3NwKglieU-Yp6sq5iMmZweOkqDEwmJL1E",
   *         "token_exp": 1448305167,
   *         "token_iat": 1448301567,
   *         "user": {
   *           "meta": {
   *             "url": "http://localhost:8000/api/auth/admins/56510e7b6c754729ece7b02b"
   *           },
   *           "data": {
   *             "updated_at": 1448220446,
   *             "created_at": 1448152700,
   *             "username": "someUser",
   *             "email": "user@server.com",
   *             "role": "ADMIN",
   *             "profile": {
   *               "meta": {
   *                 "url": null
   *               },
   *               "data": {
   *                 "url": "",
   *                 "company": "",
   *                 "location": "",
   *                 "phone": "",
   *                 "surname": "Whatever",
   *                 "name": "aName",
   *                 "avatar": "//www.gravatar.com/avatar/cec5944b19f0fbf04fc18f0a149e6ef0",
   *                 "image": {
   *                   "updated_at": 1448220443,
   *                   "created_at": 1448220443,
   *                   "contentType": "image/png",
   *                   "size": 635230,
   *                   "path": "uploads/VJiN8-iXx.png",
   *                   "host": "192.168.1.10:8000",
   *                   "url": "http://192.168.1.10:8000/uploads/VJiN8-iXx.png",
   *                   "id": "5652171a2e804f2f4f576aae"
   *                 }
   *               }
   *             },
   *             "id": "56510e7b6c754729ece7b02b",
   *             "privileges": {
   *               "users": true,
   *               "managers": true,
   *               "admins": true,
   *               "knowledge_base": true
   *             }
   *           }
   *         }
   *       }
   *     }
   *
   * @apiError (401) {Boolean} error Error.
   * @apiError (401) {Number} errorCode Error code.
   * @apiError (401) {String} message Error description.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": {
   *         "code": "401",
   *         "message": "Invalid username or password"
   *       }
   *     }
   */
  router.route('/auth').post(restrictByApplicationMiddleware, authMiddleware, controller.login.bind(controller));


  /**
   * @api {delete} /api/auth/{token} Logout
   * @apiName Logout
   * @apiGroup Auth
   * @apiDescription Deauthenticates the user by invalidating the token.
   *
   * @apiExample Example usage:
   * curl -4 -i -X DELETE http://localhost:9000/api/auth/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
   *
   * @apiHeader {String} Authorization Auth. header containing the token.
   *
   * @apiSuccess {String} message Logout success message.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta" : {},
   *       "data" : {
   *         "message": "User has been successfully logged out"
   *       }
   *     }
   *
   * @apiError (401) {Boolean} error Error.
   * @apiError (401) {Number} errorCode Error code.
   * @apiError (401) {String} message Error description.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": {
   *         "code": "401",
   *         "message": "invalid_token"
   *       }
   *     }
   */
  router.route('/auth/:token').delete(controller.logout.bind(controller));


  /**
   * @api {put} /api/auth/:token Token renewal
   * @apiName TokenRenew
   * @apiGroup Auth
   * @apiDescription Creates a new token with a new expiry date without requiring the user to send again its credentials.
   *
   * @apiExample Example usage:
   * curl -4 -i -X PUT http://localhost:9000/api/auth/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
   *
   * @apiHeader {String} Authorization Auth. header containing the token.
   *
   * @apiSuccess {String} id User id.
   * @apiSuccess {String} username Username.
   * @apiSuccess {String} email User email.
   * @apiSuccess {String} token JWT.
   * @apiSuccess {Number} token_exp Token expiry date (Unix time).
   * @apiSuccess {Number} token_iat Token issue date (Unix time).
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta" : {},
   *       "data" : {
   *         "id": "54ee6175465eaee35cd237ed",
   *         "username": "demo",
   *         "email": "demo@demo.demo",
   *         "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTQ0ODYsImV4cCI6MTQyNzgxODA4Nn0.pZVBE_GKvJUr4BI7BDeTmIIy9gQ2p3tlrG2pcMcjm3U",
   *         "token_exp": 1427818086,
   *         "token_iat": 1427814486
   *       }
   *     }
   *
   * @apiError (401) {Boolean} error Error.
   * @apiError (401) {Number} errorCode Error code.
   * @apiError (401) {String} message Error description.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": {
   *         "code": "401",
   *         "message": "invalid_token"
   *       }
   *     }
   */
  router.route('/auth/:token').put(controller.tokenRenew.bind(controller));


  /**
   * @api {get} /api/auth/:token Token verification
   * @apiName Verify
   * @apiGroup Auth
   * @apiDescription Verifies if the token is valid and has not expired.
   *
   * @apiExample Example usage:
   * curl -4 -i http://localhost:9000/api/auth/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
   *
   * @apiHeader {String} Authorization Auth. header containing the token.
   *
   * @apiSuccess {String} message Auth. verification result.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta" : {},
   *       "data" : {
   *         "message": "Token is valid"
   *       }
   *     }
   *
   * @apiError (401) {Boolean} error Error.
   * @apiError (401) {Number} errorCode Error code.
   * @apiError (401) {String} message Error description.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": {
   *         "code": "401",
   *         "message": "invalid_token"
   *       }
   *     }
   */
  router.route('/auth/:token').get(controller.tokenVerify.bind(controller));

};

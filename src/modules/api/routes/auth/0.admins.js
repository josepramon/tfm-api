'use strict';

var
  _                      = require('lodash'),
  config                 = require('src/config'),
  moduleBasePath         = '../..',

  InjectParamsMiddleware = require(moduleBasePath + '/middleware/bodyParamsInjector').middleware,

  AddFiltersMiddleware   = require(moduleBasePath + '/middleware/addFilters').middleware,

  // restrict access to the routes based on the user privileges
  PrivilegesMiddleware   = require(moduleBasePath + '/middleware/privilegesAccessFilter').middleware,

  // don't let a user access/modify another user (unless admins)
  userRestrictToItself   = require(moduleBasePath + '/middleware/userRestrictToItself').middleware,

  UsersController        = require(moduleBasePath + '/controllers/UsersController'),
  controller             = new UsersController();


// Setup the middleware applied to the list/create/delete actions
// to restrict the access only to allowed users
var requiredPermissions = { admins: true };
var accessControlFilter = _.partial(PrivilegesMiddleware, requiredPermissions);


// Get the users role id (used on the next middlewares)
var
  RoleUtil = require(moduleBasePath + '/util/RoleUtil'),
  roleId   = RoleUtil.getIdCb( config.roles.admin );


// When creating a user, preset the role
var setRole = _.partial(InjectParamsMiddleware, { role: roleId }, true);

// Filters
var adminsFilter = _.partial(AddFiltersMiddleware, { role: roleId }, true);


module.exports = function(router) {

  router.route('/auth/admins')

  /**
   * @apiDefine Auth_Admins
   *
   * Auth/Admins
   * Admins API endpoint
   */

    /**
     * @apiDefine permission_auth_admins  Global module access for `Auth_Admins` is required.
     */

    /**
     * @apiDefine permission_auth_admins_self  A user can only access to their own record (ADMINS have access to all).
     */


    /**
     * @apiDefine Auth_Managers_CommonApiParams
     *
     * @apiParam {String}  [include]  Nested objects to expand. It can be an array.
     * @apiParam {Integer} [per_page] The methods that return multiple models are paginated by default. This determines
     *                                the number of elements returned (by default 20). There's a hard limit (200). Requests
     *                                with a greater value will return only the maximum allowed items.
     * @apiParam {Integer} [page]     The results page (for paginated results)
     * @apiParam {String}  [sort]     Sort criteria. Accepts multiple values (arrays or separated with commas).
     *                                It also accepts the sort direction (if not provided, 'asc' will be used).
     *                                Accepted values: `1`, `-1`, `asc`, `desc`.
     *                                Examples:
     *                                  `?sort=id`
     *                                  `?sort=id|asc`
     *                                  `?sort=id|asc,name|desc`
     *                                  `?sort[]=id|asc&sort[]=name`
     *
     */


    /**
     * @apiDefine Auth_Managers_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine Auth_Managers_SingleEntityResponse
     *
     * @apiSuccess {Object} data                 The User data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.username        User name
     * @apiSuccess {String} data.email           User email
     * @apiSuccess {String} data.role            User Role
     * @apiSuccess {Object} [data.profile]       User profile
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @apiDefine Auth_Managers_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               The Users data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.username        User name
     * @apiSuccess {String} data.email           User email
     * @apiSuccess {String} data.role            User Role
     * @apiSuccess {Object} [data.profile]       User profile
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @api {get} /auth/admins List the users
     * @apiName List
     * @apiDescription List all the users (with an USER role)
     * @apiGroup Auth_Admins
     *
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/auth/admins --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_MultipleEntityResponse
     *
     * @apiPermission permission_auth_admins
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta" : {
     *         "url": "http://localhost:9000/api/auth/admins",
     *         "paginator": {
     *           "total_entries": 100,
     *           "total_pages": 5,
     *           "page": 1,
     *           "per_page": 20
     *         }
     *       },
     *       "data": [
     *         {
     *           "email": "demo@demo.com",
     *           "username": "foo",
     *           "role": "562bb8139e6d738cf1756094",
     *           "id": "562c0902c6f7237d5f303659"
     *           "updated_at": 1434627873,
     *           "created_at": 1434627873
     *         },
     *         {
     *           "email": "demo2@demo.com",
     *           "username": "bar",
     *           "role": "562bb8139e6d738cf1756094",
     *           "id": "562d359113200eacb9ed378c"
     *           "updated_at": 1434628060,
     *           "created_at": 1434628060
     *         }
     *       ]
     *     }
     *
     */
    .get(accessControlFilter, adminsFilter, controller.getAll.bind(controller))


    /**
     * @api {post} /auth/admins Create (register) a new user
     * @apiName Create
     * @apiGroup Auth_Admins
     *
     * @apiParam {String} username       Username, must be unique.
     * @apiParam {String} password       Password.
     * @apiParam {String} email          Email,must be unique.
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=foo&password=bar&email=someEmail@domain.tld' http://localhost:9000/api/auth/admins
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/auth/admins/5582cedfbc15803005798b8f"
     *       },
     *       "data": {
     *         "email": "demo2@demo.com",
     *         "email": "demo2@demo.com",
     *         "username": "foo",
     *         "role": "562bb8139e6d738cf1756094",
     *         "id": "562d359113200eacb9ed378c"
     *         "updated_at": 1434628060,
     *         "created_at": 1434628060
     *       }
     *     }
     *
     */
    .post(accessControlFilter, setRole, controller.create.bind(controller));



  router.route('/auth/admins/:id')

    /**
     * @api {get} /auth/admins/:id Get an user
     * @apiName Get
     * @apiDescription Get the user with that id
     * @apiGroup Auth_Admins
     *
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/auth/admins/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_SingleEntityResponse
     *
     * @apiPermission permission_auth_admins_self
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/auth/admins/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "id": "562e18f5ea83189f4497e01a",
     *         "username": "foo",
     *         "email": "email1@domain.com",
     *         "role": "562bb8109e6d738cf175607a",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089
     *       }
     *     }
     *
     */
    .get(userRestrictToItself, controller.getOne.bind(controller))

    /**
     * @api {put} /auth/admins/:id Update a user
     * @apiName Update
     * @apiDescription Update the user with this id
     * @apiGroup Auth_Admins
     *
     * @apiParam {String} username       Username, must be unique.
     * @apiParam {String} password       Password.
     * @apiParam {String} email          Email,must be unique.
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'username=foo&password=bar&email=someEmail@domain.tld' http://localhost:9000/api/auth/admins/5581f70e4901e5baa84a9652
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_SingleEntityResponse
     *
     * @apiPermission permission_auth_admins_self
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/auth/admins/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "id": "562e18f5ea83189f4497e01a",
     *         "username": "foo",
     *         "email": "email1@domain.com",
     *         "role": "562bb8109e6d738cf175607a",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089
     *       }
     *     }
     *
     */
    .put(userRestrictToItself, controller.update.bind(controller))

    /**
     * @api {patch} /auth/admins/:id Partial update a user
     * @apiName Patch
     * @apiDescription Update the user with this id. Only provided values will be applied
     * @apiGroup Auth_Admins
     *
     * @apiParam {String} [username]       Username, must be unique.
     * @apiParam {String} [password]       Password.
     * @apiParam {String} [email]          Email,must be unique.
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PATCH -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNjg4MjM5NSwiZXhwIjoxNDM2ODg1OTk1fQ.-ezinK068LnnUgotT7FVg2QRu4vGM2KAmBwK55kxj7M" -H "Content-Type: application/x-www-form-urlencoded" -d 'email=someEmail@domain.tld' 'http://localhost:9000/api/auth/admins/55a4fc5b356e6df4d223618e'
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_SingleEntityResponse
     *
     * @apiPermission permission_auth_admins_self
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/auth/admins/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "id": "562e18f5ea83189f4497e01a",
     *         "username": "foo",
     *         "email": "email1@domain.com",
     *         "role": "562bb8109e6d738cf175607a",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089
     *       }
     *     }
     *
     */
    .patch(userRestrictToItself, controller.updatePartial.bind(controller))

    /**
     * @api {delete} /auth/admins/:id Delete a user
     * @apiName Delete
     * @apiDescription Delete the user with this id
     * @apiGroup Auth_Admins
     *
     * @apiUse Auth_Managers_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i -X DELETE http://localhost:9000/api/auth/admins/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Auth_Managers_CommonApiResponseHeader
     * @apiUse Auth_Managers_SingleEntityResponse
     *
     * @apiPermission Auth_Managers
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {},
     *       "data": {
     *         "id": "562e18f5ea83189f4497e01a",
     *         "username": "foo",
     *         "email": "email1@domain.com",
     *         "role": "562bb8109e6d738cf175607a",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089
     *       }
     *     }
     *
     */
    .delete(userRestrictToItself, controller.delete.bind(controller));

};

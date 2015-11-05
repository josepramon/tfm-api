'use strict';

var
  _                    = require('lodash'),
  PrivilegesMiddleware = require('src/modules/api/middleware/privilegesAccessFilter').middleware,
  CategoriesController = require('../../controllers/CategoriesController'),
  controller           = new CategoriesController();


// Setup the middleware applied to the put, patch, delete actions
// to restrict the access only to allowed users
var requiredPermissions = {
  // require global access to the module
  knowledge_base: true
};
var accessControlFilter = _.partial(PrivilegesMiddleware, requiredPermissions);


module.exports = function(router) {

  router.route('/knowledge_base/categories')

  /**
   * @apiDefine KnowledgeBase_Categories
   *
   * KnowledgeBase/Categories
   * Categories API endpoint
   */

    /**
     * @apiDefine knowledge_base  Global module access for `knowledge_base` is required.
     */


    /**
     * @apiDefine KnowledgeBase_Categories_CommonApiParams
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
     * @apiDefine KnowledgeBase_Categories_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiSuccess {Object} data                 The Category data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.name            Category name
     * @apiSuccess {String} data.description     Category description
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @apiDefine KnowledgeBase_Categories_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               The Categories data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.name            Category name
     * @apiSuccess {String} data.description     Category description
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @api {get} /knowledge_base/categories List the categories
     * @apiName List
     * @apiDescription List all the categories
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/knowledge_base/categories --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_MultipleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta" : {
     *         "url": "http://localhost:9001/knowledge_base/categories",
     *         "paginator": {
     *           "total_entries": 100,
     *           "total_pages": 5,
     *           "page": 1,
     *           "per_page": 20
     *         }
     *       },
     *       "data": [
     *         {
     *           "description": "Category description",
     *           "slug": "category-slug-1",
     *           "name": "Category name",
     *           "updated_at": 1434627873,
     *           "created_at": 1434627873,
     *           "id": "5582af212207075ddbc42210"
     *         },
     *         {
     *           "description": "Category description",
     *           "slug": "category-slug-2",
     *           "name": "Category name",
     *           "updated_at": 1434628060,
     *           "created_at": 1434628060,
     *           "id": "5582afdc2cf7b648dcf84aba"
     *         }
     *       ]
     *     }
     *
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/categories Create a new category
     * @apiName Create
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiParam {String} name          Category name.
     * @apiParam {String} description    Category content.
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=Category+name&slug=category-slug&description=Category+description' http://localhost:9000/api/knowledge_base/categories
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/auth/users/562d694276663150095d9143"
     *       },
     *       "data": {
     *         "updated_at": 1434636000,
     *         "created_at": 1434636000,
     *         "role": "562bb8139e6d738cf1756094",
     *         "username": "someName",
     *         "email": "somename@somedomain.com",
     *         "id": "562d694276663150095d9143"
     *       }
     *     }
     *
     */
    .post(controller.create.bind(controller));



  router.route('/knowledge_base/categories/:id')

    /**
     * @api {get} /knowledge_base/categories/:id Get an category
     * @apiName Get
     * @apiDescription Get the category with that id
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/knowledge_base/categories/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/categories/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "name": "Test",
     *         "slug": "this-is-a-test",
     *         "description": "HOLAQUETAL",
     *         "updated_at": 1434622332,
     *         "created_at": 1434518089,
     *         "id": "5581f70e4901e5baa84a9652"
     *       }
     *     }
     *
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/categories/:id Update an category
     * @apiName Update
     * @apiDescription Update the category with this id
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiParam {String} name          Category name.
     * @apiParam {String} description    Category content.
     * @apiParam {String} [slug]         Slug. If there's already some category with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another category with that slug,
     *                                   the slug for this category will be *foo-1*
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=Test&slug=this-is-a-test&description=HOCTL%C2%B7LA' http://localhost:9000/api/knowledge_base/categories/5581f70e4901e5baa84a9652
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/categories/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "name": "Test",
     *         "slug": "this-is-a-test",
     *         "description": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "id": "5581f70e4901e5baa84a9652"
     *       }
     *     }
     *
     */
    .put(accessControlFilter, controller.update.bind(controller))


    /**
     * @api {patch} /knowledge_base/categories/:id Partial update an category
     * @apiName Patch
     * @apiDescription Update the category with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiParam {String} [name]        Category name.
     * @apiParam {String} [description]  Category content.
     * @apiParam {String} [slug]         Slug. If there's already some category with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another category with that slug,
     *                                   the slug for this category will be *foo-1*
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PATCH -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNjg4MjM5NSwiZXhwIjoxNDM2ODg1OTk1fQ.-ezinK068LnnUgotT7FVg2QRu4vGM2KAmBwK55kxj7M" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=A+new+name&description=A+new+description' 'http://localhost:9000/api/knowledge_base/categories/55a4fc5b356e6df4d223618e'
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/categories/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "name": "Test",
     *         "slug": "this-is-a-test",
     *         "description": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "id": "5581f70e4901e5baa84a9652"
     *       }
     *     }
     *
     */
    .patch(accessControlFilter, controller.updatePartial.bind(controller))


    /**
     * @api {delete} /knowledge_base/categories/:id Delete an category
     * @apiName Delete
     * @apiDescription Delete the category with this id
     * @apiGroup KnowledgeBase_Categories
     *
     * @apiUse KnowledgeBase_Categories_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i -X DELETE http://localhost:9000/api/knowledge_base/categories/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Categories_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Categories_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {},
     *       "data": {
     *         "name": "Test",
     *         "slug": "this-is-a-test",
     *         "description": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "id": "5581f70e4901e5baa84a9652"
     *       }
     *     }
     *
     */
    .delete(accessControlFilter, controller.delete.bind(controller));


};

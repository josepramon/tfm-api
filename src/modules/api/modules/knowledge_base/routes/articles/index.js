'use strict';

var
  _                    = require('lodash'),
  PrivilegesMiddleware = require('src/modules/api/middleware/privilegesAccessFilter').middleware,
  ArticlesController   = require('../../controllers/ArticlesController'),
  controller           = new ArticlesController();


// Setup the middleware applied to the put, patch, delete actions
// to restrict the access only to allowed users
var requiredPermissions = {
  // require global access to the module
  knowledge_base: true
};
var accessControlFilter = _.partial(PrivilegesMiddleware, requiredPermissions);


module.exports = function(router) {

  router.route('/knowledge_base/articles')

  /**
   * @apiDefine KnowledgeBase_Articles
   *
   * KnowledgeBase/Articles
   * Articles API endpoint
   */

    /**
     * @apiDefine knowledge_base  Global module access for `knowledge_base` is required.
     */


    /**
     * @apiDefine KnowledgeBase_Articles_CommonApiParams
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
     * @apiDefine KnowledgeBase_Articles_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine KnowledgeBase_Articles_SingleEntityResponse
     *
     * @apiSuccess {Object} data                 The Article data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.title           Title
     * @apiSuccess {String} data.body            Article body
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} [data.excerpt]       Excerpt
     * @apiSuccess {String} data.published       Publish status
     * @apiSuccess {String} [data.publish_date]  Publish date
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     * @apiSuccess {String} data.commentable     Commenting enabled
     * @apiSuccess {String} data.tags            Post tags. Collapsed by default (only a `meta` node with the collection url and the item count).
     *                                           Can be expanded to the full tag objects (see the `include` parameter)
     *
     */


    /**
     * @apiDefine KnowledgeBase_Articles_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               The Articles data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.title           Title
     * @apiSuccess {String} data.body            Article body
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} [data.excerpt]       Excerpt
     * @apiSuccess {String} data.published       Publish status
     * @apiSuccess {String} [data.publish_date]  Publish date
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     * @apiSuccess {String} data.commentable     Commenting enabled
     * @apiSuccess {String} data.tags            Post tags. Collapsed by default (only a `meta` node with the collection url and the item count).
     *                                           Can be expanded to the full tag objects (see the `include` parameter)
     *
     */


    /**
     * @api {get} /knowledge_base/articles List the articles
     * @apiName List
     * @apiDescription List all the articles
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/knowledge_base/articles --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_MultipleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta" : {
     *         "url": "http://localhost:9001/knowledge_base/articles",
     *         "paginator": {
     *           "total_entries": 100,
     *           "total_pages": 5,
     *           "page": 1,
     *           "per_page": 20
     *         }
     *       },
     *       "data": [
     *         {
     *           "body": "Article body",
     *           "excerpt": "Article excerpt",
     *           "slug": "article-slug-1",
     *           "title": "Article title",
     *           "updated_at": 1434627873,
     *           "created_at": 1434627873,
     *           "commentable": true,
     *           "publish_date": 1434540,
     *           "published": true,
     *           "id": "5582af212207075ddbc42210",
     *           "tags": {
     *             "meta": {
     *               "url": "http://localhost:9000/api/knowledge_base/articles/5582af212207075ddbc42210/tags",
     *               "count": 0
     *             }
     *           }
     *         },
     *         {
     *           "body": "Article body",
     *           "excerpt": "Article excerpt",
     *           "slug": "article-slug-2",
     *           "title": "Article title",
     *           "updated_at": 1434628060,
     *           "created_at": 1434628060,
     *           "commentable": true,
     *           "publish_date": 1434540,
     *           "published": true,
     *           "id": "5582afdc2cf7b648dcf84aba",
     *           "tags": {
     *             "meta": {
     *               "url": "http://localhost:9000/api/knowledge_base/articles/5582afdc2cf7b648dcf84aba/tags",
     *               "count": 0
     *             }
     *           }
     *         }
     *       ]
     *     }
     *
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/articles Create a new article
     * @apiName Create
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiParam {String} title          Post title.
     * @apiParam {String} body           Post content.
     * @apiParam {String} [excerpt]      Excerpt.
     * @apiParam {Boolean} published     Publish status.
     * @apiParam {Number} [publish_date] Publish date, as a timestamp. If `published` is true and the `publish_date` is
     *                                   provided, the post will not be published until that date.
     * @apiParam {String} commentable    Enable user comments.
     * @apiParam {mixed}  tags           Post tags, as objects (an array of this objects is accepted)
     *                                   The objects must have an id attribute for existing tags. If the tag does not have
     *                                   an ID it is assumed to be a new one and the creation of the tag will be attempted.
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=Article+title&slug=article-slug&excerpt=Article+excerpt&body=Article+body&commentable=1&published=1&publish_date=1434540172' http://localhost:9000/api/knowledge_base/articles
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_SingleEntityResponse
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



  router.route('/knowledge_base/articles/:id')

    /**
     * @api {get} /knowledge_base/articles/:id Get an article
     * @apiName Get
     * @apiDescription Get the article with that id
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/knowledge_base/articles/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/articles/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "title": "Test",
     *         "slug": "this-is-a-test",
     *         "excerpt": "Holaquetal",
     *         "body": "HOLAQUETAL",
     *         "updated_at": 1434622332,
     *         "created_at": 1434518089,
     *         "commentable": true,
     *         "publish_date": 1434540,
     *         "published": true,
     *         "id": "5581f70e4901e5baa84a9652",
     *         "tags": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/articles/5581f70e4901e5baa84a9652/tags",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/articles/:id Update an article
     * @apiName Update
     * @apiDescription Update the article with this id
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiParam {String} title          Post title.
     * @apiParam {String} body           Post content.
     * @apiParam {String} [slug]         Slug. If there's already some post with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another post with that slug,
     *                                   the slug for this post will be *foo-1*
     * @apiParam {String} [excerpt]      Excerpt.
     * @apiParam {Boolean} published     Publish status.
     * @apiParam {Number} [publish_date] Publish date, as a timestamp. If `published` is true and the `publish_date` is
     *                                   provided, the post will not be published until that date.
     * @apiParam {String} commentable    Enable user comments.
     * @apiParam {mixed}  tags           Post tags, as objects (an array of this objects is accepted)
     *                                   The objects must have an id attribute for existing tags. If the tag does not have
     *                                   an ID it is assumed to be a new one and the creation of the tag will be attempted.
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=Test&slug=this-is-a-test&excerpt=Holaquetal&body=HOCTL%C2%B7LA&commentable=1&published=1&publish_date=1434540172' http://localhost:9000/api/knowledge_base/articles/5581f70e4901e5baa84a9652
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/articles/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "title": "Test",
     *         "slug": "this-is-a-test",
     *         "excerpt": "Holaquetal",
     *         "body": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "commentable": true,
     *         "publish_date": 1434540,
     *         "published": true,
     *         "id": "5581f70e4901e5baa84a9652",
     *         "tags": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/articles/5581f70e4901e5baa84a9652/tags",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .put(accessControlFilter, controller.update.bind(controller))


    /**
     * @api {patch} /knowledge_base/articles/:id Partial update an article
     * @apiName Patch
     * @apiDescription Update the article with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiParam {String} [title]        Post title.
     * @apiParam {String} [body]         Post content.
     * @apiParam {String} [slug]         Slug. If there's already some post with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another post with that slug,
     *                                   the slug for this post will be *foo-1*
     * @apiParam {String} [excerpt]      Excerpt.
     * @apiParam {Boolean} [published]   Publish status.
     * @apiParam {Number} [publish_date] Publish date, as a timestamp. If `published` is true and the `publish_date` is
     *                                   provided, the post will not be published until that date.
     * @apiParam {String} [commentable]  Enable user comments.
     * @apiParam {mixed}  [tags]         Post tags, as objects (an array of this objects is accepted)
     *                                   The objects must have an id attribute for existing tags. If the tag does not have
     *                                   an ID it is assumed to be a new one and the creation of the tag will be attempted.
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PATCH -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNjg4MjM5NSwiZXhwIjoxNDM2ODg1OTk1fQ.-ezinK068LnnUgotT7FVg2QRu4vGM2KAmBwK55kxj7M" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=A+new+title&excerpt=Holaquetal&body=A+new+body' 'http://localhost:9000/api/knowledge_base/articles/55a4fc5b356e6df4d223618e'
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/articles/5581f70e4901e5baa84a9652"
     *       },
     *       "data": {
     *         "title": "Test",
     *         "slug": "this-is-a-test",
     *         "excerpt": "Holaquetal",
     *         "body": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "commentable": true,
     *         "publish_date": 1434540,
     *         "published": true,
     *         "id": "5581f70e4901e5baa84a9652",
     *         "tags": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/articles/5581f70e4901e5baa84a9652/tags",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .patch(accessControlFilter, controller.updatePartial.bind(controller))


    /**
     * @api {delete} /knowledge_base/articles/:id Delete an article
     * @apiName Delete
     * @apiDescription Delete the article with this id
     * @apiGroup KnowledgeBase_Articles
     *
     * @apiUse KnowledgeBase_Articles_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i -X DELETE http://localhost:9000/api/knowledge_base/articles/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse KnowledgeBase_Articles_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Articles_SingleEntityResponse
     *
     * @apiPermission knowledge_base
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {},
     *       "data": {
     *         "title": "Test",
     *         "slug": "this-is-a-test",
     *         "excerpt": "Holaquetal",
     *         "body": "HOLAQUETAL",
     *         "updated_at": 1434636343,
     *         "created_at": 1434518089,
     *         "commentable": true,
     *         "publish_date": 1434540,
     *         "published": true,
     *         "id": "5581f70e4901e5baa84a9652",
     *         "tags": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/articles/5581f70e4901e5baa84a9652/tags",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .delete(accessControlFilter, controller.delete.bind(controller));


};

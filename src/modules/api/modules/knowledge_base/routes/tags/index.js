'use strict';

module.exports = function(router) {

  var
    TagsController = require('../../controllers/TagsController'),
    controller     = new TagsController();


  router.route('/knowledge_base/tags')

  /**
   * @apiDefine KnowledgeBase_Tags
   *
   * KnowledgeBase/Tags
   * Articles tags API endpoint
   */


    /**
     * @apiDefine KnowledgeBase_Tags_CommonApiParams
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
     *                                  `?sort[]=id|asc&sort[]=name
     *
     */


    /**
     * @apiDefine KnowledgeBase_Tags_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccess {Object} data                 The Tag data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.name            Tag name
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} [data.description]   Tag description
     * @apiSuccess {String} data.articles        Articles that have the tag applied. Collapsed by default (only a `meta` node with the collection url and the item count).
     *                                           Can be expanded to the full tag objects (see the `include` parameter)
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @apiDefine KnowledgeBase_Tags_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               The Tags data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.name            Tag name
     * @apiSuccess {String} data.slug            URL slug
     * @apiSuccess {String} [data.description]   Tag description
     * @apiSuccess {String} data.articles        Articles that have the tag applied. Collapsed by default (only a `meta` node with the collection url and the item count).
     *                                           Can be expanded to the full tag objects (see the `include` parameter)
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */


    /**
     * @api {get} /knowledge_base/tags List the tags
     * @apiName List
     * @apiDescription List all the tags owned by the authenticated user
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i curl -X GET -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDg0MTE5MywiZXhwIjoxNDM0ODQ0NzkzfQ.76hpdlVfAuBI59J1OTZ6y-nNGOkj7ZVOPgZagIJMxMQ" http://localhost:9000/api/knowledge_base/tags
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_MultipleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta" : {
     *         "url": "http://localhost:9001/knowledge_base/tags",
     *         "paginator": {
     *           "total_entries": 100,
     *           "total_pages": 5,
     *           "page": 1,
     *           "per_page": 20
     *         }
     *       },
     *       "data": [
     *         {
     *           "name": "nesciunt",
     *           "slug": "nesciunt",
     *           "updated_at": 1434807342,
     *           "created_at": 1434807342,
     *           "id": "5585eeb41b7b3b821cb5ba5e",
     *           "articles": {
     *             "meta": {
     *               "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e/articles",
     *               "count": 4
     *             }
     *           }
     *         },
     *         {
     *           "name": "nostrum",
     *           "slug": "nostrum",
     *           "updated_at": 1434836605,
     *           "created_at": 1434836605,
     *           "id": "5585eeb41b7b3b821cb5ba5f",
     *           "articles": {
     *             "meta": {
     *               "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5f/articles",
     *               "count": 2
     *             }
     *           }
     *         }
     *       ]
     *     }
     *
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/tags Create a new tag
     * @apiName Create
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiParam {String} name           Tag name. (must be unique for this client)
     * @apiParam {String} [description}  Tag description.
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDg0MTE5MywiZXhwIjoxNDM0ODQ0NzkzfQ.76hpdlVfAuBI59J1OTZ6y-nNGOkj7ZVOPgZagIJMxMQ" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=foo&slug=foo&description=foo+description' http://localhost:9000/api/knowledge_base/tags
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/tags/5585f14bb3c67d5022b4262a"
     *       },
     *       "data": {
     *         "slug": "foo-1",
     *         "description": "foo description",
     *         "name": "foo",
     *         "updated_at": 1434841419,
     *         "created_at": 1434841419,
     *         "id": "5585f14bb3c67d5022b4262a",
     *         "articles": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/tags/5585f14bb3c67d5022b4262a/articles",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .post(controller.create.bind(controller));



  router.route('/knowledge_base/tags/:id')

    /**
     * @api {get} /knowledge_base/tags/:id Get a tag
     * @apiName Get
     * @apiDescription Get the tag with that id
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X GET -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDg0MTE5MywiZXhwIjoxNDM0ODQ0NzkzfQ.76hpdlVfAuBI59J1OTZ6y-nNGOkj7ZVOPgZagIJMxMQ" http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e"
     *       },
     *       "data": {
     *         "name": "nesciunt",
     *         "slug": "nesciunt",
     *         "updated_at": 1434807342,
     *         "created_at": 1434807342,
     *         "id": "5585eeb41b7b3b821cb5ba5e",
     *         "articles": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e/articles",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/tags/:id Update a tag
     * @apiName Update
     * @apiDescription Update the tag with this id
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiParam {String} name           Tag name. (must be unique for this client)
     * @apiParam {String} [description]  Tag description.
     * @apiParam {String} [slug]         Slug. If there's already some tag with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another tag with that slug,
     *                                   the slug for this tag will be *foo-1*
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDg0MTE5MywiZXhwIjoxNDM0ODQ0NzkzfQ.76hpdlVfAuBI59J1OTZ6y-nNGOkj7ZVOPgZagIJMxMQ" -H "Content-Type: application/x-www-form-urlencoded" -d 'name=bar&slug=bar&description=bar+description' http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e"
     *       },
     *       "data": {
     *         "description": "bar description",
     *         "name": "bar",
     *         "slug": "bar",
     *         "updated_at": 1434842,
     *         "created_at": 1434807342,
     *         "id": "5585eeb41b7b3b821cb5ba5e",
     *         "articles": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e/articles",
     *             "count": 2
     *           }
     *         }
     *       }
     *     }
     *
     */
    .put(controller.update.bind(controller))


    /**
     * @api {patch} /knowledge_base/tags/:id Partial update a tag
     * @apiName Patch
     * @apiDescription Update the tag with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiParam {String} [name]         Tag name. (must be unique for this client)
     * @apiParam {String} [description]  Tag description.
     * @apiParam {String} [slug]         Slug. If there's already some tag with the same slug, a numeric suffix will be added.
     *                                   For example, if the requested slug is *foo* and there's another tag with that slug,
     *                                   the slug for this tag will be *foo-1*
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PATCH -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNjg4MjM5NSwiZXhwIjoxNDM2ODg1OTk1fQ.-ezinK068LnnUgotT7FVg2QRu4vGM2KAmBwK55kxj7M" -H "Content-Type: application/x-www-form-urlencoded" -d 'description=A+new+description' 'http://localhost:9000/api/knowledge_base/tags/55a51bac5f1d3855f52861ba'
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:9001/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e"
     *       },
     *       "data": {
     *         "description": "bar description",
     *         "name": "bar",
     *         "slug": "bar",
     *         "updated_at": 1434842,
     *         "created_at": 1434807342,
     *         "id": "5585eeb41b7b3b821cb5ba5e",
     *         "articles": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e/articles",
     *             "count": 2
     *           }
     *         }
     *       }
     *     }
     *
     */
    .patch(controller.updatePartial.bind(controller))


    /**
     * @api {delete} /knowledge_base/tags/:id Delete a tag
     * @apiName Delete
     * @apiDescription Delete the tag with this id
     * @apiGroup KnowledgeBase_Tags
     *
     * @apiUse KnowledgeBase_Tags_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X DELETE -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDg0MTE5MywiZXhwIjoxNDM0ODQ0NzkzfQ.76hpdlVfAuBI59J1OTZ6y-nNGOkj7ZVOPgZagIJMxMQ" http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e
     *
     * @apiUse KnowledgeBase_Tags_CommonApiResponseHeader
     * @apiUse KnowledgeBase_Tags_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {},
     *       "data": {
     *         "name": "bar",
     *         "slug": "bar",
     *         "description": "bar description",
     *         "updated_at": 1434842,
     *         "created_at": 1434807342,
     *         "id": "5585eeb41b7b3b821cb5ba5e",
     *         "articles": {
     *           "meta": {
     *             "url": "http://localhost:9000/api/knowledge_base/tags/5585eeb41b7b3b821cb5ba5e/articles",
     *             "count": 0
     *           }
     *         }
     *       }
     *     }
     *
     */
    .delete(controller.delete.bind(controller));


};

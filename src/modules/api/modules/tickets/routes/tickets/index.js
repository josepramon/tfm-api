'use strict';

var
  _                       = require('lodash'),
  config                  = require('src/config'),

  apiBasePath             = '../../../..',
  moduleBasePath          = '../..',

  // middleware to filter out some attributes from the output
  outputFilter            = require(moduleBasePath + '/middleware/outputFilter'),

  // middleware to apply additional access restrictions on the routes
  ticketsAccessFilter     = require(moduleBasePath + '/middleware/ticketsAccessFilter'),

  TicketsController       = require('../../controllers/TicketsController'),
  controller              = new TicketsController();



module.exports = function(router) {

  // filter out some attributes from the response based on the user profile,
  // for example, don't return 'private' info (like managers notes, or tags)
  // to the regular users.
  router.use('/tickets/tickets', outputFilter);

  router.route('/tickets/tickets')

  /**
   * @apiDefine Tickets
   *
   * Tickets/Tickets
   * Suport tickets API endpoint
   */



    /**
     * @apiDefine Tickets_CommonApiParams
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
     * @apiDefine Tickets_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine Tickets_SingleEntityResponse
     *
     * @apiSuccess {Object}  data                 the ticket data
     * @apiSuccess {String}  data.id              Id
     * @apiSuccess {String}  data.title           Title
     * @apiSuccess {String}  data.body            Article body
     * @apiSuccess {Boolean} [data.closed]        Ticket closed status. If not present or has a false value, the ticket is open
     * @apiSuccess {Object}  data.user            Ticket owner. All the relations are collapsed by default (only a `meta` node with the entity url and the item count).
     *                                            Can be expanded to the full tag objects (see the `include` parameter)
     * @apiSuccess {Object}  [data.manager]       Assigned manager
     * @apiSuccess {Integer} [data.priority]      Ticket priority (4: critical, 3: hight, 2: normal, 1: low)
     * @apiSuccess {String}  data.created_at      Creation date
     * @apiSuccess {String}  data.updated_at      Last update date
     * @apiSuccess {Array}   [data.tags]          Ticket tags
     * @apiSuccess {Object}  [data.category]      Ticket category
     * @apiSuccess {Array}   [data.comments]      Ticket comments (public comments, visible to the user, and private notes, only visible to the managers)
     * @apiSuccess {Array}   [data.statuses]      Ticket statuses (sorted by creation date)
     * @apiSuccess {Array}   [data.attachments]   File atachments
     *
     */


    /**
     * @apiDefine Tickets_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               the tickets data
     * @apiSuccess {String}  data.id              Id
     * @apiSuccess {String}  data.title           Title
     * @apiSuccess {String}  data.body            Article body
     * @apiSuccess {Boolean} [data.closed]        Ticket closed status. If not present or has a false value, the ticket is open
     * @apiSuccess {Object}  data.user            Ticket owner. All the relations are collapsed by default (only a `meta` node with the entity url and the item count).
     *                                            Can be expanded to the full tag objects (see the `include` parameter)
     * @apiSuccess {Object}  [data.manager]       Assigned manager
     * @apiSuccess {Integer} [data.priority]      Ticket priority (4: critical, 3: hight, 2: normal, 1: low)
     * @apiSuccess {String}  data.created_at      Creation date
     * @apiSuccess {String}  data.updated_at      Last update date
     * @apiSuccess {Array}   [data.tags]          Ticket tags
     * @apiSuccess {Object}  [data.category]      Ticket category
     * @apiSuccess {Array}   [data.comments]      Ticket comments (public comments, visible to the user, and private notes, only visible to the managers)
     * @apiSuccess {Array}   [data.statuses]      Ticket statuses (sorted by creation date)
     * @apiSuccess {Array}   [data.attachments]   File atachments
     *
     */


    /**
     * @api {get} /tickets/tickets List the tickets
     * @apiName List
     * @apiDescription List all the tickets
     * @apiGroup Tickets
     *
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/tickets/tickets --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_MultipleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "https://mosaiqo.me/api/tickets/tickets",
     *         "paginator": {
     *           "total_entries": 14,
     *           "total_pages": 7,
     *           "page": 1,
     *           "per_page": 2
     *         }
     *       },
     *       "data": [
     *         {
     *           "updated_at": 1450099184,
     *           "created_at": 1450053124,
     *           "title": "Com puc canviar el meu email de contacte?",
     *           "body": "<p>Hola, he canviat de proveidor de correu electrònic i ara tinc un nou email. Com puc actualitzar les meves dades?</p>",
     *           "closed": true,
     *           "priority": 2,
     *           "id": "4J4XTePBl",
     *           "tags": {
     *             "meta": { "url": "", "count": 0 }
     *           },
     *           "category": {
     *             "meta": { "url": "", "count": 1 }
     *           },
     *           "attachments": {
     *             "meta": { "url": "", "count": 0 }
     *           },
     *           "comments": {
     *             "meta": { "url": "https://mosaiqo.me/api/tickets/tickets/4J4XTePBl/comments", "count": 1 }
     *           },
     *           "statuses": {
     *             "meta": { "url": "https://mosaiqo.me/api/tickets/tickets/4J4XTePBl/statuses", "count": 2 }
     *           },
     *           "user": {
     *             "meta": { "url": "", "count": 1 }
     *           },
     *           "manager": {
     *             "meta": { "url": "", "count": 1 }
     *           }
     *         }
     *       ]
     *     }
     *
     */
    .get(ticketsAccessFilter, controller.getAll.bind(controller))

    /**
     * @api {post} /tickets/tickets Create a new ticket
     * @apiName Create
     * @apiGroup Tickets
     *
     * @apiParam {String} title          Title
     * @apiParam {String} body           Ticket content
     * @apiParam {Object} category       Ticket category
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NmUwMzQ3MjdiMTk2NDk3NzI4NTQ0NSIsImlhdCI6MTQ1MDY1MTY4MiwiZXhwIjoxNDUwNjU1MjgyfQ.63BylDn_YKv2lY3DO02jjWLTXdWts8c0bYc9CySl2Og" -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=Test+title&body=Test+body&category=%7B%22id%22%3A1%7D' 'https://mosaiqo.me/api/tickets/tickets'
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_SingleEntityResponse
     *
     */
    .post(controller.create.bind(controller));

  router.route('/tickets/tickets/:id')

    /**
     * @api {get} /tickets/tickets/:id Get a ticket
     * @apiName Get
     * @apiDescription Get the ticket with that id
     * @apiGroup Tickets
     *
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/tickets/tickets/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_SingleEntityResponse
     *
     */
    .get(ticketsAccessFilter, controller.getOne.bind(controller))

    /**
     * @api {put} /tickets/tickets/:id Update a ticket
     * @apiName Update
     * @apiDescription Update the ticket with this id
     * @apiGroup Tickets
     *
     * @apiParam {String} title          Title
     * @apiParam {String} body           Ticket content
     * @apiParam {Object} category       Ticket category
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNDYzMzgwNCwiZXhwIjoxNDM0NjM3NDA0fQ.IwPItcFLIDzA1MvwDXNYjVF0PxVcQ_Mft5wAU-2D8bY" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=Test&slug=this-is-a-test&excerpt=Holaquetal&body=HOCTL%C2%B7LA&published=1&publish_date=1434540172' http://localhost:9000/api/tickets/tickets/5581f70e4901e5baa84a9652
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_SingleEntityResponse
     *
     */
    .put(ticketsAccessFilter, controller.update.bind(controller))

    /**
     * @api {patch} /tickets/tickets/:id Partial update a ticket
     * @apiName Patch
     * @apiDescription Update the ticket with this id. Only provided values will be applied
     * @apiGroup Tickets
     *
     * @apiParam {String} title          Title
     * @apiParam {String} body           Ticket content
     * @apiParam {Object} category       Ticket category
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PATCH -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsImlhdCI6MTQzNjg4MjM5NSwiZXhwIjoxNDM2ODg1OTk1fQ.-ezinK068LnnUgotT7FVg2QRu4vGM2KAmBwK55kxj7M" -H "Content-Type: application/x-www-form-urlencoded" -d 'title=A+new+title&excerpt=Holaquetal&body=A+new+body' 'http://localhost:9000/api/tickets/tickets/55a4fc5b356e6df4d223618e'
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_SingleEntityResponse
     *
     */
    .patch(ticketsAccessFilter, controller.updatePartial.bind(controller))

    /**
     * @api {delete} /tickets/tickets/:id Delete a ticket
     * @apiName Delete
     * @apiDescription Delete the ticket with this id
     * @apiGroup Tickets
     *
     * @apiUse Tickets_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i -X DELETE http://localhost:9000/api/tickets/tickets/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Tickets_CommonApiResponseHeader
     * @apiUse Tickets_SingleEntityResponse
     *
     */
    .delete(ticketsAccessFilter, controller.delete.bind(controller));
};

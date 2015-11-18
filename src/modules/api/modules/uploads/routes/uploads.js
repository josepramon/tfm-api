'use strict';

var
  _                 = require('lodash'),
  apiBasePath       = '../../..',

  // filter that restricts regular users to their own documents
  // but allows unlimited access to agents/admins
  accessFilter      = require(apiBasePath + '/middleware/restrictRegularUsersToOwnDocuments').middleware,

  // upload middleware
  uploader          = require('../util/uploader'),

  // the controller that handles the uploads
  UploadsController = require('../controllers/UploadsController'),
  controller        = new UploadsController();



module.exports = function(router) {

  router.route('/uploads')

  /**
   * @apiDefine Uploads
   *
   * Uploads
   * Uploads API endpoint
   */

    /**
     * @apiDefine Uploads_CommonApiParams
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
     * @apiDefine Uploads_CommonApiResponseHeader
     *
     * @apiSuccess {Object} meta                 Response metadata
     * @apiSuccess {String} meta.url             Resource url
     *
     */


    /**
     * @apiDefine Uploads_SingleEntityResponse
     *
     * @apiSuccess {Object} data                 The Upload data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.contentType     Upload file contentType
     * @apiSuccess {Number} data.size            File size, in bytes
     * @apiSuccess {String} data.path            Path to the file
     * @apiSuccess {String} data.host            Host name, for the server where the file is
     *                                           (useful when uploading to S3)
     * @apiSuccess {String} data.url             File url
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */

    /**
     * @apiDefine Uploads_MultipleEntityResponse
     *
     * @apiSuccess {Object} [meta.paginator]     Pagination params
     * @apiSuccess {Object[]} data               The Uploads data
     * @apiSuccess {String} data.id              Id
     * @apiSuccess {String} data.contentType     Upload file contentType
     * @apiSuccess {Number} data.size            File size, in bytes
     * @apiSuccess {String} data.path            Path to the file
     * @apiSuccess {String} data.host            Host name, for the server where the file is
     *                                           (useful when uploading to S3)
     * @apiSuccess {String} data.url             File url
     * @apiSuccess {String} data.created_at      Creation date
     * @apiSuccess {String} data.updated_at      Last update date
     *
     */

     /**
     * @api {get} /uploads List the uploads
     * @apiName List
     * @apiDescription List all the uploads (where the user performing the request has privileges)
     * @apiGroup Uploads
     *
     * @apiUse Uploads_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/uploads --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Uploads_CommonApiResponseHeader
     * @apiUse Uploads_MultipleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:8000/api/uploads",
     *         "paginator": {
     *           "total_entries": 1,
     *           "total_pages": 1,
     *           "page": 1,
     *           "per_page": 20
     *         }
     *       },
     *       "data": [
     *         {
     *           "updated_at": 1447882689,
     *           "created_at": 1447882689,
     *           "contentType": "image/png",
     *           "size": 275815,
     *           "path": "uploads/EJnAR0rmg.png",
     *           "host": "files.helpdesk.mosaiqo.me",
     *           "url": "http://localhost:8000/uploads/EJnAR0rmg.png",
     *           "id": "564cefc1ef9cd7a0426495e8"
     *         }
     *       ]
     *     }
     *
     */
    .get(accessFilter, controller.getAll.bind(controller))

    /**
     * @api {post} /uploads Upload a newfile
     * @apiName Create
     * @apiGroup Uploads
     *
     * @apiParam {File} file   The file
     * @apiUse Uploads_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NGNlZjg5ZWY5Y2Q3YTA0MjY0OTVlNyIsImlhdCI6MTQ0Nzg4MjY2OCwiZXhwIjoxNDQ3ODg2MjY4fQ.S0PcSY3WSKn1TzSVmJPuOpTKmr_XJerQtKI1EHaCeQY" -H "Cache-Control: no-cache" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "file=hhhehehe.gif" 'http://localhost:8000/api/uploads'
     *
     * @apiUse Uploads_CommonApiResponseHeader
     * @apiUse Uploads_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f"
     *       },
     *       "data": {
     *         "updated_at": 1447884284,
     *         "created_at": 1447884284,
     *         "contentType": "image/gif",
     *         "size": 1409876,
     *         "path": "uploads/NymbHkIQx.gif",
     *         "host": "files.helpdesk.mosaiqo.me",
     *         "url": "http://files.helpdesk.mosaiqo.me/uploads/NymbHkIQx.gif",
     *         "id": "564cf5fb00e1e92a5124e44f"
     *       }
     *     }
     *
     */
    .post(uploader.single('file'), controller.create.bind(controller));


  router.route('/uploads/:id')

    /**
     * @api {get} /uploads/:id Get an upload
     * @apiName Get
     * @apiDescription Get the upload with that id
     * @apiGroup Uploads
     *
     * @apiUse Uploads_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -4 -i http://localhost:9000/api/uploads/551c31d0430d78991f5931e1 --header "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGVlNjE3NTQ2NWVhZWUzNWNkMjM3ZWQiLCJpYXQiOjE0Mjc4MTczNTksImV4cCI6MTQyNzgyMDk1OX0.M3BboY6U9RJlX1ulVG7e9xRVrVdY3qVhvp3jmZaOCJ8"
     *
     * @apiUse Uploads_CommonApiResponseHeader
     * @apiUse Uploads_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f"
     *       },
     *       "data": {
     *         "updated_at": 1447884284,
     *         "created_at": 1447884284,
     *         "contentType": "image/gif",
     *         "size": 1409876,
     *         "path": "uploads/NymbHkIQx.gif",
     *         "host": "files.helpdesk.mosaiqo.me",
     *         "url": "http://files.helpdesk.mosaiqo.me/uploads/NymbHkIQx.gif",
     *         "id": "564cf5fb00e1e92a5124e44f"
     *       }
     *     }
     *
     */
    .get(accessFilter, controller.getOne.bind(controller))

    /**
     * @api {put} /uploads/:id Update an upload
     * @apiName Update
     * @apiDescription Update the upload with this id (replace the file)
     * @apiGroup Uploads
     *
     * @apiParam {File} file   The file
     * @apiUse Uploads_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NGNlZjg5ZWY5Y2Q3YTA0MjY0OTVlNyIsImlhdCI6MTQ0Nzg4MjY2OCwiZXhwIjoxNDQ3ODg2MjY4fQ.S0PcSY3WSKn1TzSVmJPuOpTKmr_XJerQtKI1EHaCeQY" -H "Cache-Control: no-cache" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "file=File 14-11-15 12 07 34.png" 'http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f'
     *
     * @apiUse Uploads_CommonApiResponseHeader
     * @apiUse Uploads_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f"
     *       },
     *       "data": {
     *         "updated_at": 1447884553,
     *         "created_at": 1447884284,
     *         "contentType": "image/png",
     *         "size": 618149,
     *         "path": "uploads/V1TM8yLml.png",
     *         "host": "files.helpdesk.mosaiqo.me",
     *         "url": "http://files.helpdesk.mosaiqo.me/uploads/V1TM8yLml.png",
     *         "id": "564cf5fb00e1e92a5124e44f"
     *       }
     *     }
     *
     */
    .put(accessFilter, uploader.single('file'), controller.update.bind(controller))

    /**
     * @api {patch} /uploads/:id Partial update an upload
     * @apiName Patch
     * @apiDescription This method is exactly equal to the PUT one, defined for consistency
     * @apiGroup Uploads
     */
    .patch(accessFilter, uploader.single('file'), controller.updatePartial.bind(controller))

    /**
     * @api {delete} /uploads/:id Delete an upload
     * @apiName Delete
     * @apiDescription Delete the upload record with this id (and delete the file)
     * @apiGroup Uploads
     *
     * @apiUse Uploads_CommonApiParams
     *
     * @apiExample Example usage:
     * curl -X DELETE -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NGNlZjg5ZWY5Y2Q3YTA0MjY0OTVlNyIsImlhdCI6MTQ0Nzg4MjY2OCwiZXhwIjoxNDQ3ODg2MjY4fQ.S0PcSY3WSKn1TzSVmJPuOpTKmr_XJerQtKI1EHaCeQY" -H "Cache-Control: no-cache" 'http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f'
     *
     * @apiUse Uploads_CommonApiResponseHeader
     * @apiUse Uploads_SingleEntityResponse
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "meta": {
     *         "url": "http://localhost:8000/api/uploads/564cf5fb00e1e92a5124e44f"
     *       },
     *       "data": {
     *         "updated_at": 1447884553,
     *         "created_at": 1447884284,
     *         "contentType": "image/png",
     *         "size": 618149,
     *         "path": "uploads/V1TM8yLml.png",
     *         "host": "files.helpdesk.mosaiqo.me",
     *         "url": "http://files.helpdesk.mosaiqo.me/uploads/V1TM8yLml.png",
     *         "id": "564cf5fb00e1e92a5124e44f"
     *       }
     *     }
     *
     */
    .delete(accessFilter, controller.delete.bind(controller));

};

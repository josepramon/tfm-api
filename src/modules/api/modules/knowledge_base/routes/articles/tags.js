'use strict';

module.exports = function(router) {

  var
    ArticlesTagsController = require('../../controllers/ArticlesTagsController'),
    controller             = new ArticlesTagsController(),
    tagArticlesMiddleware  = require('../../middleware/tagArticles');


  router.route('/knowledge_base/articles/:articleId/tags')

    /**
     * @apiDefine KnowledgeBase_ArticlesTags
     *
     * KnowledgeBase/Articles/Tags
     *
     * Tags API endpoint for some article.
     *
     * This is exactly equal to [KnowledgeBase/Tags](#api-KnowledgeBase_Tags) except limiting the results to some article.
     */


    /**
     * @api {get} /knowledge_base/articles/:articleId/tags List the tags
     * @apiName List
     * @apiDescription List all the tags applied to some post
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/articles/:articleId/tags Create a new tag
     * @apiName Create
     * @apiDescription Create a new tag and assing it to the article
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .post(tagArticlesMiddleware, controller.create.bind(controller));



  router.route('/knowledge_base/articles/:articleId/tags/:id')

    /**
     * @api {get} /knowledge_base/articles/:articleId/tags/:id Get a tag
     * @apiName Get
     * @apiDescription Get the tag with that id (for that article)
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/articles/:articleId/tags/:id Update a tag
     * @apiName Update
     * @apiDescription Update the tag with this id
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .put(controller.updatePartial.bind(controller))


    /**
     * @api {patch} /knowledge_base/articles/:articleId/tags/:id Partial update a tag
     * @apiName Patch
     * @apiDescription Update the tag with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .patch(controller.update.bind(controller))


    /**
     * @api {delete} /knowledge_base/articles/:articleId/tags/:id Delete a tag
     * @apiName Delete
     * @apiDescription Delete the tag with this id
     * @apiGroup KnowledgeBase_ArticlesTags
     */
    .delete(controller.delete.bind(controller));


};

'use strict';

var
  CategoryArticlesController = require('../../controllers/CategoryArticlesController'),
  controller                 = new CategoryArticlesController(),
  categoryArticlesMiddleware = require('../../middleware/categoryArticles');


module.exports = function(router) {

  router.route('/knowledge_base/categories/:categoryId/articles')

    /**
     * @apiDefine KnowledgeBase_CategoryArticles
     *
     * KnowledgeBase/Categories/Articles
     *
     * Articles API endpoint for articles with some category.
     *
     * This is exactly equal to [KnowledgeBase/Articles](#api-KnowledgeBase_Articles) except limiting the results to some tag.
     */


    /**
     * @api {get} /knowledge_base/categories/:categoryId/articles List the articles
     * @apiName List
     * @apiDescription List all the articles tagged witth some tag
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/categories/:categoryId/articles Create a new article
     * @apiName Create
     * @apiDescription Create a new article and assign it to the category
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .post(categoryArticlesMiddleware, controller.create.bind(controller));



  router.route('/knowledge_base/categories/:categoryId/articles/:id')

    /**
     * @api {get} /knowledge_base/categories/:categoryId/articles/:id Get an article
     * @apiName Get
     * @apiDescription Get the article with that id (and with that tag)
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/categories/:categoryId/articles/:id Update an article
     * @apiName Update
     * @apiDescription Update the article with this id
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .put(controller.update.bind(controller))


    /**
     * @api {patch} /knowledge_base/categories/:categoryId/articles/:id Partial update an article
     * @apiName Patch
     * @apiDescription Update the article with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .patch(controller.updatePartial.bind(controller))


    /**
     * @api {delete} /knowledge_base/categories/:categoryId/articles/:id Delete an article
     * @apiName Delete
     * @apiDescription Delete the article with this id
     * @apiGroup KnowledgeBase_CategoryArticles
     */
    .delete(controller.delete.bind(controller));


};

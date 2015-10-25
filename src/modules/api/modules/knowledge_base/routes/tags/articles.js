'use strict';

var
  TagsArticlesController = require('../../controllers/TagsArticlesController'),
  controller             = new TagsArticlesController(),
  articleTagsMiddleware  = require('../../middleware/articleTags');

  
module.exports = function(router) {

  router.route('/knowledge_base/tags/:tagId/articles')

    /**
     * @apiDefine KnowledgeBase_TagsArticles
     *
     * KnowledgeBase/Tags/Articles
     *
     * Articles API endpoint for articles tagged with some tag.
     *
     * This is exactly equal to [KnowledgeBase/Articles](#api-KnowledgeBase_Articles) except limiting the results to some tag.
     */


    /**
     * @api {get} /knowledge_base/tags/:tagId/articles List the articles
     * @apiName List
     * @apiDescription List all the articles tagged witth some tag
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .get(controller.getAll.bind(controller))


    /**
     * @api {post} /knowledge_base/tags/:tagId/articles Create a new article
     * @apiName Create
     * @apiDescription Create a new article and assign it to the tag
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .post(articleTagsMiddleware, controller.create.bind(controller));



  router.route('/knowledge_base/tags/:tagId/articles/:id')

    /**
     * @api {get} /knowledge_base/tags/:tagId/articles/:id Get an article
     * @apiName Get
     * @apiDescription Get the article with that id (and with that tag)
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .get(controller.getOne.bind(controller))


    /**
     * @api {put} /knowledge_base/tags/:tagId/articles/:id Update an article
     * @apiName Update
     * @apiDescription Update the article with this id
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .put(controller.update.bind(controller))


    /**
     * @api {patch} /knowledge_base/tags/:tagId/articles/:id Partial update an article
     * @apiName Patch
     * @apiDescription Update the article with this id. Only provided values will be applied
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .patch(controller.updatePartial.bind(controller))


    /**
     * @api {delete} /knowledge_base/tags/:tagId/articles/:id Delete an article
     * @apiName Delete
     * @apiDescription Delete the article with this id
     * @apiGroup KnowledgeBase_TagsArticles
     */
    .delete(controller.delete.bind(controller));


};

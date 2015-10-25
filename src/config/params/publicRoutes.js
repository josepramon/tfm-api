module.exports = {

  // ROUTES that don't require JWT auth
  publicRoutes: [

    // ROOT
    // (the root route doesn't do anything,
    // it just returns a string to test the API is working)
    // -------------------------------------------------------------------------
    /api\/?$/i,


    // AUTH
    // JWT token actions (create, destroy, verify, refresh)
    // -------------------------------------------------------------------------
    /api\/auth\/?$/i,


    // PASSWORD RECOVERY
    // -------------------------------------------------------------------------
    /api\/auth\/recover(\/[a-f\d]{24})?\/?$/i,


    // END USERS REGISTRATION
    // -------------------------------------------------------------------------
    { url: /api\/auth\/users\/?$/i, methods: ['POST'] },


    // KNOWLEDGE BASE:
    // -------------------------------------------------------------------------
    // only list and read are public (any other action requires auth)

    // allows:
    // /api/knowledge_base/articles
    // /api/knowledge_base/articles/{:id}
    // /api/knowledge_base/articles/{:id}/tags
    // /api/knowledge_base/articles/{:id}/tags/{:id}
    // /api/knowledge_base/articles/{:id}/categories
    // /api/knowledge_base/articles/{:id}/categories/{:id}
    { url: /api\/knowledge_base\/articles((\/[a-f\d]{24})(\/(tags|categories)(\/[a-f\d]{24})?)?)?\/?$/i, methods: ['GET'] },

    // allows:
    // /api/knowledge_base/tags
    // /api/knowledge_base/tags/{:id}
    // /api/knowledge_base/tags/{:id}/articles
    // /api/knowledge_base/tags/{:id}/articles/{:id}
    { url: /api\/knowledge_base\/tags((\/[a-f\d]{24})(\/articles(\/[a-f\d]{24})?)?)?\/?$/i, methods: ['GET'] },

    // allows:
    // /api/knowledge_base/categories
    // /api/knowledge_base/categories/{:id}
    // /api/knowledge_base/categories/{:id}/articles
    // /api/knowledge_base/categories/{:id}/articles/{:id}
    { url: /api\/knowledge_base\/categories((\/[a-f\d]{24})(\/articles(\/[a-f\d]{24})?)?)?\/?$/i, methods: ['GET'] },

  ]
};

var
  _          = require('underscore'),
  stringUtil = require('../../../util/string');


/**
 * Knowledge base filters
 * @type {Object}
 */
module.exports = {

  /**
   * Custom filter for published articles
   */
  getPublishedFilter: function(filters) {
    var
      publishedFilter = {},
      filterValue = filters.isPublished;

    if(_.isEmpty(filterValue)) {
      filterValue = true;
    } else {
      filterValue = _.contains(['1', 'true'], filterValue.toLowerCase());
    }

    if(filterValue) {

      publishedFilter = {$and: [
        { 'published': true },
        { $or: [
            { 'publish_date': {$lte: new Date()} },
            { 'publish_date': null }
        ]}
      ]};

    } else {

      publishedFilter = { $or: [
        { 'published': false },
        { 'publish_date': {$gt: new Date()} }
      ]};
    }

    return publishedFilter;
  },


  /**
   * Custom filter for published articles (on nested collections)
   *
   * TODO: this is extremely hacky, and should be implemented properly
   */
  setNestedArticlesPublishedFilter: function(filters, request) {

    // get the filter
    var filter = this.getPublishedFilter(filters);

    // encode it
    filter = stringUtil.escapeQueryParam(JSON.stringify(filter));

    // translate the filter to a include directive...
    var expands = request.parseExpands(request.req.query.include);

    var articlesExpandIndex = _.findIndex(expands, function(expand) {
      var expandPath = expand.split(':')[0];
      return expandPath === 'articles';
    });

    var filterVal = ':filter(' + filter + ')';

    if(articlesExpandIndex > -1) {
      expands[articlesExpandIndex] += filterVal;
    } else {
      expands.push('articles' + filterVal);
    }

    request.req.query.include = expands;
  }

};

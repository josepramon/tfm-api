'use strict';

var
  faker  = require('faker'),
  slug   = require('slug'),
  data   = [];


for(var i=0, l=10; i < l; i++) {
  var
    title = faker.lorem.sentence(),
    body  = faker.lorem.paragraphs(6),
    date  = faker.date.recent();

  data.push({
    title        : title,
    slug         : slug(title),
    excerpt      : body.split('\n \r\t')[0],
    body         : body,
    published    : true,
    published_at : date,
    commentable  : true,
    created_at   : date,
    updated_at   : date
  });
}


exports['knowledge_base.articles'] = data;

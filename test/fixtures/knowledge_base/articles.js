'use strict';

var
  faker  = require('faker'),
  slug   = require('slug'),
  data   = [];


var nl2p = function(str) {
  return str.replace(/\\r/g, '').split('\n').map(function(p) {
    return '<p>'+p+'</p>';
  }).join('\n');
};

for(var i=0, l=10; i < l; i++) {
  var
    title = faker.lorem.sentence(),
    date  = faker.date.recent();

  data.push({
    title        : title,
    slug         : slug(title),
    excerpt      : nl2p(faker.lorem.paragraphs(2)),
    body         : nl2p(faker.lorem.paragraphs(6)),
    published    : true,
    published_at : date,
    commentable  : true,
    created_at   : date,
    updated_at   : date
  });
}


exports['knowledge_base.articles'] = data;

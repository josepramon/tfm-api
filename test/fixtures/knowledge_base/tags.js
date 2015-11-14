'use strict';

var
  faker  = require('faker'),
  slug   = require('slug'),
  data   = [];


for(var i=0, l=10; i < l; i++) {
  var
    name = faker.lorem.words(1).join(),
    date = faker.date.recent();

  data.push({
    name        : name,
    slug        : slug(name),
    description : faker.lorem.paragraph(),
    articles    : [],
    created_at  : date,
    updated_at  : date
  });
}


exports['knowledge_base.tags'] = data;

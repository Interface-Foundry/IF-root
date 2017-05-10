var ingest = require('./ingest');
var co = require('co');

co(function * () {
  yield ingest('Ypo', [
    'code',
    'name',
    'description',
    'price',
    'unit_type',
    'unspsc_code',
    'category_1',
    'category_2',
    'keywords',
    'image_url',
    'product_url'
  ]);
});

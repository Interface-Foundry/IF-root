var ingest = require('./ingest');
var co = require('co');



/**
 * key value to map the keys from the tsv to better values
 *
 * Item -> code
 * Code Name -> name
 * Description -> description
 * Price -> price
 * UOM -> unit_type
 * UNSPSC code -> unspsc_code
 * Category 1
 * Category 2
 * Keywords
 * Image URL
 * Product URL
 */
const ypoFieldDict = {
    'Item Code': 'item_code',
    'Code Name':'name',
    'Description': 'description',
    'Price': 'price',
    'UOM': 'unit_type',
    'UNSPSC code': 'unspsc_code',
    'Category 1': 'category_1',
    'Category 2': 'category_2',
    'Keywords': 'keywords',
    'Image URL': 'image_url',
    'Product URL': 'product_url'
  }

co(function * () {
  yield ingest('Ypo', ypoFieldDict, ['name', 'keywords']);
  process.exit();
});

var fs = require('co-fs')
var path = require('path')
var db = require('../../db')

db.then((models) => { db = models; })

var getYpoCategories = function * () {
  // read in categories file
  var categories = yield fs.readFile(path.join(__dirname, '../../ingest/categories.json'));
  categories = JSON.parse(categories.toString());
  var categoryArray = [];
  var id = 0;

  //replace sub-categories w/ accumulated counts of all subcategories
  yield Object.keys(categories).map(function * (cat) {
    var categoryObject = {
      itemCount: 0,
      humanName: cat,
      machineName: cat,
      searchType: 'category',
      id: id++
    }

    var sampleItem = yield db.YpoInventoryItems.findOne({category_2: cat});

    categoryObject.image = sampleItem.image_url

    Object.keys(categories[cat]).map(c => {
      categoryObject.itemCount += Number(categories[cat][c]);
    })
    categoryArray.push(categoryObject)
  })
  console.log('categories:', categoryArray)
  return categoryArray;
}

var getAmazonCategories = function () {
  return Object.keys(amazonCategories).map(cat => {
    return {
      humanName: cat,
      machineName: amazonCategories[cat],
      searchType: 'category',
      id: amazonCategories[cat]
    }
  })
}

module.exports = {
  getYpoCategories: getYpoCategories,
  getAmazonCategories: getAmazonCategories
}

var db = require('db');
var fs = require('fs');

var allItems = [];
//var categories = ['Outerwear', 'Dresses', 'Tops', 'Skirts', 'Pants', 'Underwear', 'Activewear', 'Tights & Leggings', 'Shoes', 'Bags', 'Accessories', 'Jewelry', 'Hats'];
var categories = ['Dresses', 'Tops', 'Skirts', 'Pants'];

db.Landmarks.find({
  world: false,
  'itemTags.categories': {$in: categories}
}).select('name description price linkback itemTags.categories').exec(function(e, items) {
  console.log('db returned', items.length, 'items');
  items = items.reduce(function(items, i) {
    i = i.toObject();

    // pluck out the first category
    i.tag = i.itemTags.categories.reduce(function(c, tag) {
      if (c) {
        return c;
      } else if (categories.indexOf(tag) >= 0) {
        return tag;
      }
    }, false);

    delete i.itemTags;
    delete i.parentName

    // only train on items with a parsed category
    if (i.tag) {
      items.push(i);
    }
    return items;
  }, []);

  console.log('found', items.length, 'items');

  fs.writeFileSync(__dirname + '/categoryTrainingSet.js', 'module.exports = ' + JSON.stringify(items));
  process.exit(0);
});

var db = require('db');
var fs = require('fs');

var allItems = [];
db.Landmarks.find({
  world: false,
  name: /shirt/i
}).select('name description price linkback').exec(function(e, items) {
  items = items.map(function(i) {
    i = i.toObject();
    i.tag = 'shirt';
    return i;
  })
  allItems = allItems.concat(items);

  db.Landmarks.find({
    world: false,
    name: /dress/i
  }).select('name description price linkback').exec(function(e, items) {
    items = items.map(function(i) {
      i = i.toObject();
      i.tag = 'dress';
      return i;
    })
    allItems = allItems.concat(items);

    fs.writeFileSync('./trainingSet.js', 'module.exports = ' + JSON.stringify(allItems, null, 2));
    process.exit(0);
  })
})

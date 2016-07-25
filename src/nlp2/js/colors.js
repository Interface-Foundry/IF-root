var ntc = require('./name_that_color')
var kdtree = require('static-kdtree')

//Create the tree
var tree = kdtree(ntc.docs.map(function(c) {
  return c.rgb.concat(c.hsl);
}))


// return a list of similar colors
// input: a name of a color, like "blue"
module.exports = function(color) {
  // get the hsl for this color name
  // color = color.toLowerCase();
  color = color.toString().toLowerCase();
  if (!ntc.names2[color]) {
    return []
  }
  var hsl = ntc.names2[color].slice(2);

  // return the 3 closest docs from the tree
  return tree.knn(hsl, 4).map(function(i) {
    return ntc.docs[i];
  })
}

module.exports.isColor = function(text) {
  return !!ntc.parseName(text);
}

if (!module.parent) {
  console.log('run tests with mocha')
}
if (module.parent && module.parent.filename.indexOf('mocha.js') > 0) {
  var tests = [
    {color: 'blue', result: ['navy', 'aqua']}
  ];
  var should = require('should')
  describe('similar color engine', function() {
    tests.map(function(t) {
      it(t.color, function() {
        module.exports(t.color).should.deepEqual(t.result);
      })
    })
  })
}

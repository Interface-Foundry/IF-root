var Fuse = require('fuse.js')
console.time('loading data')
var cuisines = require('./cuisine_classifier.json')
console.timeEnd('loading data')

console.time('data->array')
cuisines = Object.keys(cuisines).map(function (name) {
  return {
    'name': name,
    'possibleValues': cuisines[name]
  }
})
console.timeEnd('data->array')

function cuisineClassifier (text) {
  var baseOptions = {
    shouldSort: true,
    threshold: 0.6,
    keys: ['name']
  }

  var fuse = new Fuse(cuisines, baseOptions)
  var res = fuse.search(text)

  if (res.length > 0) {
    res = res[0].possibleValues
    return Object.keys(res).reduce(function (a, b) {
      var s = res[a] > res[b] ? a : b
      // return res[a] > res[b] ? a : b
      return s
    })
  } else {
    // no matches
    return null
  }
}

// module.exports.cuisineClassifier = cuisineClassifier

if (!module.parent) {
  var co = require('co')
  // wow such test
  co(function * () {
    console.time('searching1')
    console.log(cuisineClassifier('lasange'))
    console.timeEnd('searching1')
    console.time('searching1')
    console.log(cuisineClassifier('lasangs'))
    console.timeEnd('searching1')

    console.time('searching2')
    console.log(cuisineClassifier('salmon rollz'))
    console.timeEnd('searching2')
  })
}

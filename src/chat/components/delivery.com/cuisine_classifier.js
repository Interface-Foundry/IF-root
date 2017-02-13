var Fuse = require('fuse.js')
var cuisines = require('./cuisine_classifier.json')

cuisines = Object.keys(cuisines).map(function (name) {
  return {
    'name': name,
    'possibleValues': cuisines[name]
  }
})

function cuisineClassifier (text, otherCuisines) {
  var baseOptions = {
    shouldSort: true,
    threshold: 0.3,
    distance: 3,
    keys: ['name']
  }

  var fuse = new Fuse(cuisines, baseOptions)
  var res = fuse.search(text)

  if (res.length > 0) {
    logging.info('matched with cuisine.json item')
    res = res[0].possibleValues
    return Object.keys(res).reduce(function (a, b) {
      var cuisine = res[a] > res[b] ? a : b
      // return res[a] > res[b] ? a : b
      return cuisine
    })
  } else {
    logging.info('no cuisine matches with parameters from cuisine.json file')
    // no matches from cuisine.json searcher
    var extraOptions = {
      shouldSort: true,
      threshold: 0.4,
      distance: 5,
      tokenize: true,
      keys: ['name']
    }

    fuse = new Fuse(otherCuisines, extraOptions)
    res = fuse.search(text)

    if (res.length > 0) {
      return text
    }
  }
  logging.warn('no results from cuisineClassifier, returning null')
  return null
}

module.exports = cuisineClassifier

// example for testing
// if (!module.parent) {
//   var logging = require('../../../logging.js')
//   var co = require('co')

//   // wow such test
//   co(function * () {
//     console.time('searching1')
//     console.log(cuisineClassifier('lasange'))
//     console.timeEnd('searching1')
//     console.time('searching1')
//     console.log(cuisineClassifier('lasangs'))
//     console.timeEnd('searching1')

//     console.time('searching2')
//     console.log(cuisineClassifier('cheeseburger'))
//     console.timeEnd('searching2')
//     console.time('searching2')
//     console.log(cuisineClassifier('salmon roll'))
//     console.timeEnd('searching2')
//   })
// }

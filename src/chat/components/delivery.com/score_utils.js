var utils = {}

//takes the votes array from the foodSession
//returns an array of cuisines ranked according to the result of the
//weighted votes
var rankCuisines = function (votes) {
  var cuisineVotes = {}
  votes.map(v => {
    if (cuisineVotes[v.vote]) cuisineVotes[v.vote] += v.weight
    else cuisineVotes[v.vote] = v.weight
  })

  // console.log('cuisineVotes', cuisineVotes)

  return Object.keys(cuisineVotes).sort(function (a, b) {
    return cuisineVotes[b] - cuisineVotes[a]
  })
}

//we want all the scores to be three digits long
var normalize = function (value, max) {
  // console.log('value, max:', value, max)
  var normalized = parseFloat(value) / (parseFloat(max) + 0.001)
  if (normalized > 0) console.log('normalized:', parseInt(Math.floor(1000 * normalized)))
  return parseInt(Math.floor(1000 * normalized))
}

//each of these functions will return an (independent) numeric score
//with a fixed number of digits
//add them together as strings and then convert back to Number
//in order to preserve a strict hierarchy of scoring criteria

var cuisineScore = function (m, cuisines) {
  var merchantCuisines = m.summary.cuisines
  var bestCuisineScore = cuisines.length
  for (var i = 0; i < merchantCuisines.length; i++) {
    var index = cuisines.indexOf(merchantCuisines[i])
    if (index > -1 && index < bestCuisineScore) {
      bestCuisineScore = index
    }
  }
  bestCuisineScore = cuisines.length - bestCuisineScore
  if (bestCuisineScore > 0) console.log('bestCuisineScore', bestCuisineScore)
  return normalize(bestCuisineScore, cuisines.length)
}

var historyScore = function () {

}

var yelpScore = function () {

}

utils.cuisineSort = function (m, votes) {
  //score by cuisine
  var cuisines = rankCuisines(votes)
  return cuisineScore(m, cuisines)

  //w/in cuisines rank by order-history

  //w/in history score by yelp
}

module.exports = utils;

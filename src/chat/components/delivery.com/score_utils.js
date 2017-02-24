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

  console.log('cuisineVotes', cuisineVotes)

  return Object.keys(cuisineVotes).sort(function (a, b) {
    return cuisineVotes[b] - cuisineVotes[a]
  })
}

//we want all the scores to be three digits long
var normalize = function (value, max) {
  var normalized = parseFloat(value) / (parseFloat(max) + 0.001)
  return parseInt(Math.floor(1000 * normalized))
}

//each of these functions will return an (independent) numeric score
//with a fixed number of digits
//add them together as strings and then convert back to Number
//in order to preserve a strict hierarchy of scoring criteria

//TODO: this needs to be tested, like, at all
var cuisineScore = function (m, votes) {
  var cuisines = rankCuisines(votes)
  var merchantCuisines = m.summary.cuisines
  var bestCuisineScore = 0
  for (var i = 0; i < merchantCuisines.length; i++) {
    var index = cuisines.indexOf(merchantCuisines[i])
    if (index > -1 && cuisines.length - index > bestCuisineScore) {
      bestCuisineScore = cuisines.length - index
    }
  }
  console.log('bestCuisineScore', bestCuisineScore)
  return normalize(bestCuisineScore, cuisines.length)
}

var historyScore = function () {

}

var yelpScore = function () {

}

utils.cuisineSort = function (m, votes) {
  //score by cuisine
  console.log(cuisineScore(m, votes))

  //w/in cuisines rank by order-history

  //w/in history score by yelp
}

module.exports = utils;

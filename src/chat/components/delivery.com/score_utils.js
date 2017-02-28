var utils = {}

//returns the cuisine that would win a straight
//vote-count, or null if there's a tie
utils.voteWinner = function (votes) {
  var cuisines = {}
  votes.map(function (v) {
    if (cuisines[v.vote]) cuisines[v.vote]++
    else cuisines[v.vote] = 1
  })
  var max = 0
  var winner = null;
  for (var cuisine in cuisines) {
    if (cuisines[cuisine] > max) {
      winner = cuisine
      max = cuisines[cuisine]
    }
    else if (cuisines[cuisine] == max) {
      winner = null;
    }
  }
  return winner
}

//takes the votes array from the foodSession
//returns an array of cuisines ranked according to the result of the
//weighted votes
utils.rankCuisines = function (votes) {
  var cuisineVotes = {}
  votes.map(v => {
    if (cuisineVotes[v.vote]) cuisineVotes[v.vote] += v.weight
    else cuisineVotes[v.vote] = v.weight
  })
  return Object.keys(cuisineVotes).sort(function (a, b) {
    return cuisineVotes[b] - cuisineVotes[a]
  })
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
  var normalized = parseFloat(bestCuisineScore) / (parseFloat(cuisines.length) + 0.001)
  if (normalized > 0) return '' + Math.floor(1000 * normalized)
  else return '000'
}

var historyScore = function (m, sb) {
  if (!sb.meta.order_frequency) return '000'
  var team_history = sb.meta.order_frequency[m.id]
  if (team_history) {
    console.log('team_history.count', team_history.count)
    if (team_history.count > 10) return '' + team_history.count
    else if (team_history.count > 2) return '0' + team_history.count
    else return '00'
  }
  else return '00'
}

utils.cuisineSort = function (m, votes, slackbot) {
  //score by cuisine
  //w/in cuisines rank by order-history
  var cuisines = utils.rankCuisines(votes)
  var cScore = cuisineScore(m, cuisines)
  var hScore = historyScore(m, slackbot)
  // console.log('entire score:', cScore + hScore)
  return cScore + hScore

  //w/in history score by yelp
}

module.exports = utils;

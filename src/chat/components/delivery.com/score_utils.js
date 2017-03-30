/** @exports score_utils */
var utils = {}

/**
* evaluates which cuisine would win a straight vote-count
* @param votes {array} user votes, from the foodSession
* @returns the name of the cuisine that would win in a straight vote-count, or null if there's a tie
*/
utils.voteWinner = function (votes) {
  var cuisines = {};
  votes.map(function (v) {
    if (cuisines[v.vote]) cuisines[v.vote]++;
    else cuisines[v.vote] = 1;
  });
  var max = 0;
  var winner = null;
  for (var cuisine in cuisines) {
    if (cuisines[cuisine] > max) {
      winner = cuisine;
      max = cuisines[cuisine];
    }
    else if (cuisines[cuisine] == max) {
      winner = null;
    }
  }
  return winner;
};

/**
* Strictly ranks the cuisines according to the number of (weighted) votes they got
* @param the votes array from the foodSession
* @returns an array of cuisines ranked according to the result of the weighted vote-count
*/
utils.rankCuisines = function (votes) {
  var cuisineVotes = {};
  votes.map(v => {
    if (cuisineVotes[v.vote]) cuisineVotes[v.vote] += v.weight;
    else cuisineVotes[v.vote] = v.weight;
  });
  return Object.keys(cuisineVotes).sort(function (a, b) {
    return cuisineVotes[b] - cuisineVotes[a];
  });
};

//each of these functions will return an (independent) numeric score
//with a fixed number of digits
//add them together as strings and then convert back to Number
//in order to preserve a strict hierarchy of scoring criteria

/**
* returns a three-digit score reflecting the place in the cuisine ranking of the merchant's highest ranked cuisine
* @param m {object} merchant to be scored
* @param cuisines {array} the ranked array of cuisines returned by utils.rankCuisines
* @returns {string} a three-digit score reflecting the place in the cuisine ranking of the merchant's highest ranked cuisine
*/
var cuisineScore = function (m, cuisines) {
  var merchantCuisines = m.summary.cuisines;
  var bestCuisineScore = cuisines.length;
  for (var i = 0; i < merchantCuisines.length; i++) {
    var index = cuisines.indexOf(merchantCuisines[i]);
    if (index > -1 && index < bestCuisineScore) {
      bestCuisineScore = index;
    }
  }
  bestCuisineScore = cuisines.length - bestCuisineScore;
  var normalized = parseFloat(bestCuisineScore) / (parseFloat(cuisines.length) + 0.001);
  if (normalized > 0) return '' + Math.floor(1000 * normalized);
  else return '000';
};

/**
* returns a two-digit score reflecting how many times the team has reordered from the merchant
* @param m {object} merchant to be scored
* @param sb {object} slackbot (which contains the team history)
* @returns {string} a two-digit score reflecting how many times the team has reordered from the merchant
*/
var historyScore = function (m, sb) {
  if (!sb.meta.order_frequency) return '00';
  var team_history = sb.meta.order_frequency[m.id];
  if (team_history) {
    console.log('team_history.count', team_history.count);
    if (team_history.count > 10) return '' + team_history.count;
    else if (team_history.count > 2) return '0' + team_history.count;
    else return '00';
  }
  else return '00';
};

/**
* returns a five-digit score composed of first the cuisine score and second the history score,
* so that the cuisine score takes strict precedence over the history score
* @param m {object} merchant to be scored
* @param votes {array} the votes array from the foodSession
* @param sb {object} slackbot (which contains the team history)
* @returns {string} a five-digit score composed for the cuisine score and the history score
*/
utils.cuisineSort = function (m, votes, slackbot) {
  var cuisines = utils.rankCuisines(votes);
  var cScore = cuisineScore(m, cuisines);
  var hScore = historyScore(m, slackbot);
  return cScore + hScore;
};

module.exports = utils;

var stopwords = require('./stopwords');
var natural = require('natural');

/**
 * Takes a list of words, remomves the stop words, returns array
 * Some of the tokens may be multiple words if they match a multiple
 * token work in our fashion tag database
 *
 * tokenize(string text, bool expand=true)
 */
var tokenizer = new natural.WordTokenizer();
var tokenize = module.exports = function(text, expand) {
  //
  // Separate
  //
  var tokens = tokenizer.tokenize(text);

  //
  // Replace stop words
  //
  tokens = tokens.filter(function(token) {
    return stopwords.indexOf(token.toLowerCase()) === -1;
  })


  tokens = tokens.map(function(t) {
    return natural.PorterStemmer.stem(t);
  })
  
  return tokens.join(' ');
}

// To test, just do "node tokenize.js"
if (!module.parent) {
  var strings = [
    'Very cute dress',
    'black tie women',
    'sweatshirt for men'
  ];

  strings.map(function(s) {
    console.log(s, ':', tokenize(s))
  })
}

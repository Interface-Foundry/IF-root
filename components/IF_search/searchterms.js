var stopwords = require('./stopwords');
var fs = require('fs');
var natural = require('natural');


var rgbtxt = fs.readFileSync('./rgb.txt', 'utf8').split('\n').slice(1);
var colormap = module.exports.colormap = {};
var colors = module.exports.colors = rgbtxt.map(function(line) {
  line = line.split('\t');
  if (line[0] && line[1]) {
    colormap[line[0]] = line[1];
    return line[0];
  }
})


/**
 * Get the words from teh spreadsheet
 *    ________________
 * ,./ cool story bro \
 *   \________________/
 */
var tsvfile = fs.readFileSync('./List of Tags in Kip Search - terms.tsv',  'utf8');
tsvfile = tsvfile.split('\r\n');
var buckets = tsvfile[1].split('\t').slice(1).map(function(val) {
  return {
    name: val,
    boost:0, //default
    words: []
  }
});
tsvfile[0].split('\t').slice(1).map(function(val, i) {
  buckets[i].boost = val;
})
tsvfile.slice(2).map(function(row) {
  row.split('\t').slice(1).map(function(val, i) {
    if (val && val !== '') {
      buckets[i].words.push(natural.PorterStemmer.stem(val.toLowerCase()));
    }
  })
})
buckets.push({
  name: 'colors',
  boost: 5,
  words: colors
})
module.exports.buckets = buckets;

var tokenizer = new natural.WordTokenizer();
/**
 * Takes a list of words, remomves the stop words, returns array
 */
var tokenize = function(text) {
  var tokens = [];
  tokenizer.tokenize(text).map(function(token) {
    if (stopwords.indexOf(token) === -1) {
      tokens.push(natural.PorterStemmer.stem(token.toLowerCase()));
    }
  })
  return tokens;
}


/**
 * Takes a list of words, remomves the stop words, and splits the remaining
 * words into fashion buckets.
 */
var split = module.exports.parse = function(terms) {
  var tokens = tokenize(terms);

  var bucketTerms = tokens.reduce(function (bucketTerms, t) {
    var categorized = false;
    buckets.map(function(bucket) {
      if (bucket.words.indexOf(t) >= 0) {
        bucketTerms[bucket.name] = bucketTerms[bucket.name] || [];
        bucketTerms[bucket.name].push(t);
        categorized = true;
      }
    })
    if (!categorized) {
      bucketTerms.uncategorized.push(t);
    }
    return bucketTerms;
  }, {'uncategorized': []});

  if (bucketTerms.uncategorized.length === 0) {
    delete bucketTerms.uncategorized;
  }

  return bucketTerms;

}

/**
 * Turns a bunch of bucketd terms into an elasticsearch query
 */
var getElasticsearchQuery = function (bucketTerms) {
  var matches = Object.keys(bucketTerms).map(function(bucketName) {
    if (bucketName === 'uncategorized') return; // uncategorized handled differently
    var bucket = buckets[bucketName];
    var terms = bucketTerms[bucketName];
    return {
      match: {
        content: {
          query: terms.join(' '),
          boost: bucket.boost
        }
      }
    }
  });

  var query = {
    query: {
      bool: {
        should: matches
      }
    }
  };

  return query;
}

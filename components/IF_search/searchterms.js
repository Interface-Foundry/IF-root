var stopwords = require('./stopwords');
var tsv = require('tsv');
var fs = require('fs');
var tsvfile = fs.readFileSync('./List of Tags in Kip Search - terms.tsv',  'utf8');
var buckets = [];
tsvfile = tsvfile.split('\r\n');
buckets = tsvfile[1].split('\t').slice(1).map(function(val) {
  return {
    name: val
  }
});


console.log(buckets);
process.exit(0);
tsvfile[0].split('\t').map(function(val) {

})
tsvfile.split('\n').map(function(line) {
  line.split()
})




/**
 * Takes a list of words, remomves the stop words, returns array
 */
var tokenize = function(text) {
  var tokens = [];
  text.split(/\s+/).map(function(token) {
    if (stopwords.indexOf(token) === -1) {
      tokens.push(token);
    }
  })
  return tokens;
}


/**
 * Takes a list of words, remomves the stop words, and splits the remaining
 * words into fashion buckets.
 */
var split = function(terms) {
  var tokens = tokenize(terms);

  var bucketTerms = tokens.reduce(function (bucketTerms, t) {
    buckets.map(function(bucket) {
      if (bucket.words.indexOf(t) >= 0) {
        bucketTerms[bucket.name] = bucketTerms[bucket.name] || [];
        bucketTerms.push(t);
      }
    })
  }, {});

  return bucketTerms;

}

/**
 * Turns a bunch of bucketd terms into an elasticsearch query
 */
var getElasticsearchQuery = function (bucketTerms) {
  var matches = Object.keys(bucketTerms).map(function(bucketName) {
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

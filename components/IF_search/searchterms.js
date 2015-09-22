var stopwords = require('./stopwords');
var fs = require('fs');
var natural = require('natural');

/**
 * Get the list of colors and color values
 */
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
 *
 * buckets: [{
 *  name: 'item',
 *  boost: 50,
 *  words: ['jacket', 'skiboots', etc]
 * }]
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


/**
 * Get the combos from the spreadsheet
 * will look like this: {
 *  'gender__item': [{name: 'item': boost: 71}, {name: 'gender', boost: 29}]
 * }
 */
var comboTsv = fs.readFileSync('./List of Tags in Kip Search - custom weights.tsv', 'utf8')
  .split('\r\n')
  .map(function(row) {
    return row
      .split('\t')
      .filter(function(data) {
        return data !== ''
      })
  })
var combos = module.exports.combos = {};

// two-term combos
var twoTermCombosFirstValue = comboTsv[3][0];
var twoTermCombosSecondValue = comboTsv[4][0];
for (var i = 1; i < comboTsv[3].length; i++) {
  var key = comboTsv[3][i] + '__' + comboTsv[4][i];
  combos[key] = [{
      name: comboTsv[3][i],
      boost: twoTermCombosFirstValue
    }, {
      name: comboTsv[4][i],
      boost: twoTermCombosSecondValue
    }];
}

// three-term combos
var threeTermCombosFirstValue = comboTsv[7][0];
var threeTermCombosSecondValue = comboTsv[8][0];
var threeTermCombosThirdValue = comboTsv[9][0];
for (var i = 1; i < comboTsv[8].length; i++) {
  var key = comboTsv[7][i] + '__' + comboTsv[8][i] + '__' + comboTsv[9][i];
  combos[key] = [{
      name: comboTsv[7][i],
      boost: threeTermCombosFirstValue
    }, {
      name: comboTsv[8][i],
      boost: threeTermCombosSecondValue
    }, {
      name: comboTsv[9][i],
      boost: threeTermCombosThirdValue
    }];
}


/**
 * Takes a list of words, remomves the stop words, returns array
 */
var tokenizer = new natural.WordTokenizer();
var tokenize = module.exports.tokenize = function(text) {
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
 * buckets = {
 *  'item': {
 *    words: ['sweatshirt', 'sweats']
 *    boost: 50
 *  }
 * }
 */
var parse = module.exports.parse = function(terms) {
  var tokens = tokenize(terms);

  var combo = [];
  var bucketTerms = tokens.reduce(function (bucketTerms, t) {
    var categorized = false;
    buckets.map(function(bucket) {
      if (bucket.words.indexOf(t) >= 0) {
        // init this bucket if necessary
        if (!bucketTerms[bucket.name]) {
          bucketTerms[bucket.name] = {
            words: [],
            boost: bucket.boost
          }
        }
        bucketTerms[bucket.name].words.push(t);
        categorized = true;
        combo.push(bucket.name);
      }
    })
    if (!categorized) {
      bucketTerms.uncategorized.words.push(t);
      combo.push('uncategorized');
    }
    return bucketTerms;
  }, {'uncategorized': {words: [], boost: 0}});

  if (bucketTerms.uncategorized.words.length === 0) {
    delete bucketTerms.uncategorized;
  }

  // check to see if we need to apply custom weights for a SECRET COMBO
  // up up down down left right left right b a
  if (combos[combo.join('__')]) {
    combos[combo.join('__')].map(function(bucket) {
      bucketTerms[bucket.name].boost = bucket.boost;
    })
  }

  return bucketTerms;

}

/**
 * Turns a bunch of bucketd terms into an elasticsearch query
 */
var getElasticsearchQuery = module.exports.getElasticsearchQuery = function (text) {

  var bucketTerms = parse(text);

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
      bool: {
        should: matches
      }
  };

  return query;
}

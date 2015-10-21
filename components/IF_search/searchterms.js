var stopwords = require('./stopwords');
var fs = require('fs');
var natural = require('natural');
var synonyms = require('./synonyms');
var tokenize = require('./tokenize');

var DEBUG = false;

function tokenRegex(word) {
  return new RegExp('\\b' + word + '\\b')
}

/**
 * Get the list of colors and color values
 */
var rgbtxt = fs.readFileSync(__dirname + '/rgb.txt', 'utf8').split('\n').slice(1);
var colormap = module.exports.colormap = {};
var colors = module.exports.colors = rgbtxt.map(function(line) {
  line = line.split('\t');
  if (line[0] && line[1]) {
    color = tokenize(line[0]);
    colormap[color] = line[1];
    return color;
  }
})


/**
 * Get the words from teh spreadsheet
 *
 * buckets: [{
 *  name: 'item',
 *  bitmask: 2,
 *  boost: 50,
 *  words: ['jacket', 'skiboots', etc]
 * }]
 */
var tsvfile = fs.readFileSync(__dirname + '/List of Tags in Kip Search - category terms.tsv',  'utf8').split('\r\n');
var buckets = module.exports.buckets = tsvfile.slice(1).map(function(row, bucketIndex) {
  row = row.split('\t').map(function(val, i) {
    // do not transform header
    if (i === 0) {
      return val;
    }
    return tokenize(val);
  }).filter(function(val) {
    return val !== '';
  })
  return {
    name: row[0].toLowerCase().replace(/ /g, ''),
    bitmask: Math.pow(2, bucketIndex + 2),  // + 2 because the first two are reserved for "color" and "item"
    boost: row[1], //default, should often be overridden by our combos
    words: row.slice(2)
  }
});

// some custom logic for combining "major item" and "minor item" buckets
var itembucket = buckets.reduce(function(bucket, b) {
  if (b.name.indexOf('item') >= 0) {
    bucket.words = bucket.words.concat(b.words);
  }
  return bucket;
}, {name: 'item', bitmask: 2, boost: 8, words: []})
buckets = buckets.filter(function(b) {
  return b.name.indexOf('item') < 0;
})
buckets.push(itembucket);

// also add the colors
buckets.push({
  name: 'colors',
  bitmask: 1,
  boost: 6,
  words: colors
})

// make a bucket hash instead of array.
bucketHash = buckets.reduce(function(h, b) {
  h[b.name] = b;
  return h;
}, {})

bucketBitmaskHash = buckets.reduce(function(h, b) {
  h[b.bitmask] = b;
  return h;
}, {})

// make sure there are no genders in the brand bucket
bucketHash.brand.words = bucketHash.brand.words.filter(function (word) {
  return bucketHash.gender.words.indexOf(word) < 0;
})

// make sure there are no items in the pop culture bucket
bucketHash.popculture.words = bucketHash.popculture.words.filter(function (word) {
  return bucketHash.item.words.indexOf(word) < 0;
})

// colors are actually the worst
bucketHash.colors.words = bucketHash.colors.words.filter(function(word) {
  var ok = true;
  buckets.map(function(b) {
    if (b.name == 'colors') { return; }
    if (b.words.indexOf(word) >= 0) {
      ok = false;
    }
  })
  return ok;
})

/**
 * Get the combos from the spreadsheet
 * will look like this: {
 *  'gender__item': [{name: 'item': boost: 71}, {name: 'gender', boost: 29}]
 * }
 */
var comboTsv = fs.readFileSync(__dirname + '/List of Tags in Kip Search - custom weights.tsv', 'utf8')
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
  var key = [comboTsv[3][i], comboTsv[4][i]].sort().join('|').replace(/ /g, '');
  combos[key] = [{
      name: comboTsv[3][i].replace(/ /g, ''),
      boost: twoTermCombosFirstValue
    }, {
      name: comboTsv[4][i].replace(/ /g, ''),
      boost: twoTermCombosSecondValue
    }];
}

// three-term combos
var threeTermCombosFirstValue = comboTsv[7][0];
var threeTermCombosSecondValue = comboTsv[8][0];
var threeTermCombosThirdValue = comboTsv[9][0];
for (var i = 1; i < comboTsv[8].length; i++) {
  var key = [comboTsv[7][i], comboTsv[8][i], comboTsv[9][i]].sort().join('|').replace(/ /g, '');
  combos[key] = [{
      name: comboTsv[7][i].replace(/ /g, ''),
      boost: threeTermCombosFirstValue
    }, {
      name: comboTsv[8][i].replace(/ /g, ''),
      boost: threeTermCombosSecondValue
    }, {
      name: comboTsv[9][i].replace(/ /g, ''),
      boost: threeTermCombosThirdValue
    }];
}

var fashionTokenize = module.exports.fashionTokenize = function(query) {
  DEBUG && console.log('q:', query);
  var tokens = tokenize(query);
  DEBUG && console.log('tokenized:', tokens);
  tokens = synonyms.synonymize(tokens);
  DEBUG && console.log('syn:', tokens);
  return tokens.split(' ');
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
var parse = module.exports.parse = function(query) {
  var tokens = fashionTokenize(query).join(' '); // better as a single string
  bucketTerms = buckets.reduce(function(bucketTerms, bucket) {
    if (bucket.name == 'boost') {
      debugger;
    }
    var matches = bucket.words.reduce(function(matches, word) {
      if (tokens.match(tokenRegex(word))) {
        matches.push(word);
      }
      return matches;
    }, [])
    if (matches.length > 0) {
      bucketTerms[bucket.name] = {
        words: matches,
        boost: bucket.boost
      };
    }
    return bucketTerms;
  }, {})
  DEBUG && console.log('b:', bucketTerms);

  var comboKey = Object.keys(bucketTerms).sort().join('|').replace(/ /g, '').toLowerCase();
  var combo = combos[comboKey];
  if (combo) {
    combo.map(function(bucket) {
      bucketTerms[bucket.name].boost = bucket.boost;
    })
  }
  DEBUG && console.log('c:', combo);

  // add uncategorized terms
  var uncategorizedTerms = tokens.split(' ').reduce(function(uncategorizedTerms, token) {
    Object.keys(bucketTerms).map(function(bucket) {
      if (bucketTerms[bucket].words.indexOf(token) >= 0) {
        uncategorizedTerms.splice(uncategorizedTerms.indexOf(token), 1);
      }
    })
    return uncategorizedTerms;
  }, tokens.split(' '))

  if (uncategorizedTerms.length > 0) {
    bucketTerms.uncategorized = {
      words: uncategorizedTerms,
      boost: 1
    }
  }

  DEBUG && console.log('final:', bucketTerms)

  return bucketTerms;

}

/**
 * Turns a bunch of bucketd terms into an elasticsearch query
 */
var getElasticsearchQuery = module.exports.getElasticsearchQuery = function (text) {

  var bucketTerms = parse(text);
  console.log(bucketTerms);

  var matches = Object.keys(bucketTerms).map(function(bucketName) {
    //if (bucketName === 'uncategorized') return; // uncategorized handled differently
    var terms = bucketTerms[bucketName].words;
    return {
      multi_match: {
          query: terms.join(' '),
          fields: ['brand^5', 'tags^4', 'name^3', 'descriptionTags^2', 'description'],
          boost: bucketTerms[bucketName].boost
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

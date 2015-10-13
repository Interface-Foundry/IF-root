var fs = require('fs');
var natural = require('natural');

var TYPES = {
  EXPAND: 1,
  COMPRESS: 2
};

/**
 * get the mapping of synonymcs from the spreadsheet
 */
var data = module.exports.data = fs.readFileSync(__dirname + '/cinnamon-synonym trees - Expands to Include.tsv', 'utf8')
  .split('\r\n')
  .slice(1)
  .map(function(row) {
    row = row.split('\t');
    return {
      root: natural.PorterStemmer.stem(row[0]),
      words: row.filter(function(w) {
          return typeof w === 'string' && w !== '';
        }).map(natural.PorterStemmer.stem),
      type: TYPES.EXPAND
    };
  })

// also read the compress sheet
fs.readFileSync(__dirname + '/cinnamon-synonym trees - Contract-Compress into.tsv', 'utf8')
  .split('\r\n')
  .slice(1)
  .map(function(row) {
    row = row.split('\t');
    data.push({
      root: natural.PorterStemmer.stem(row[0]),
      words: row.slice(1).filter(function(w) {
          return typeof w === 'string' && w !== '';
        }).map(natural.PorterStemmer.stem),
      type: TYPES.COMPRESS
    })
  });

data = data.map(function(s) {
  s.expandRegexs = s.words.map(function(w) {
    return new RegExp('\\b' + w + '\\b'); // use boundaries
  })
  return s;
})

var compressData = data.filter(function(s) {
  return s.type === TYPES.COMPRESS;
}).map(function(s) {
  s.regexs = s.words.map(function(w) {
    return new RegExp('\\b' + w + '\\b', 'g'); // global replace
  })
  return s;
})


/**
 * finds the root of a particular word
 */
var getRoot = module.exports.getRoot = function(text) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].words.indexOf(text) >= 0) {
      return data[i].root;
    }
  }
}

/**
 * gets all the synonyms
 */
var getSynonyms = module.exports.getSynonyms = function(text) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].words.indexOf(text) >= 0) {
      return [data[i].root].concat(data[i].words);
    }
  }
}

/**
 * Uses the synonym file to compress text into the minimum meaninful vocabulary
 */
var compressText = module.exports.compress = function(text) {
  compressData.map(function(s) {
    s.regexs.map(function(r) {
      text = text.replace(r, s.root);
    });
  })
  return text;
}


/**
 * Uses the synonym file to expand text so that matches get more hits
 * /!\ warning /!\ could get unexpected results
 */
var expandText = module.exports.expand = function(text) {
  if (typeof text !== 'string') {
    return '';
  }

  data.map(function(s) {
    var hit = false;
    s.expandRegexs.map(function(r) {
      if (text.match(r)) {
        hit = true;
      }
    })

    if (hit) {
      text += ' ' + s.root;
    }
  })
  return text;
}

var test = function() {
  var should = require('should');
  strings = [
    {string: 'womans bathing suits', compressed: 'women bath suit'}
  ];
  strings.map(function(s) {
    s.string = s.string.split(' ').map(natural.PorterStemmer.stem).join(' ');
    console.log("testing", s.string);
    compressText(s.string).should.equal(s.compressed);
    console.log(expandText(s.string));
  })
}

if (!module.parent) {
  test();
}

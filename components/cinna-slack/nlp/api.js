var request = require('request')
var config = require('config')
// var normalize = require('node-normalizer')
var qtypes = require('qtypes')

var debug = require('debug')('nlp')

var BUCKET = {
  search: 'search',
  banter: 'banter',
  purchase: 'purchase'
}

var ACTION = {
  initial: 'initial',
  similar: 'similar',
  modified: 'modified',
  focus: 'focus',
  more: 'more',
  back: 'back'
}


var question;

/**
 * Call this with the text from slack
 * callback takes (err, response)
 sampleRes = {
        bucket: 'search',
        action: actionS, //initial, similar, modified, focus, more, back
        searchSelect: [1,2,3], //which item for search select
        tokens: msg,
        channel: '3EL18A0M' //example of slack channel (the user who is chatting) --> please send back from python
    };
  */
var parse = module.exports.parse = function(text, callback) {
  debug('parsing:' + text)
  var simpleResult = quickparse(text);
  if (simpleResult) {
    debug('found simple result')
    return callback(null, simpleResult)
  }

  var normalizedText = text; //normalize.clean(text); // TODO might take too long (70ms)
  debug('normalized:', normalizedText)

  var qtype = question.classify(normalizedText);
  debug('qtype:', qtype)

  request({
    method: 'POST',
    url: config.nlp + '/parse',
    json: true,
    body: {
      text: normalizedText
    }
  }, function(e, r, b) {
    if (e) {
      return callback(e);
    } else {
      return callback(null, nlpToResult(b));
    }
  })
}

/**
 * checks for really simple cases which won't require nlp
 */
function quickparse(text) {
  // remove a leading "kip" ("kip find me socks" --> "find me socks")
  text = text.replace(/^kip[,:;.! ]/i, '')
  var res = {
    bucket: BUCKET.search
  }
  regexes = {
    initial: [
      /^find me a\b/i,
      /^find me\b/i,
      /^find\b/i,
      /^search for a\b/i,
      /^search for\b/,
      /^search\b/i
    ],
    modified: [
      /\bbut\b/
    ],
    similar: [
      /like the ([\w]+)\b/i
    ],
    focus: []
  };

  var found = false;
  Object.keys(regexes).map(function(action) {
    if (found) { return }
    regexes[action].map(function(re) {
      if (found) {
        return;
      } else if (text.match(re)) {
        found = true;
        res.action = action
      } else {
        return;
      }

      switch (action) {
        case ACTION.initial:
          var q = text.replace(re, '').trim();
          res.tokens = [q];
          break;
      }
    })
  })

  if (!found) {
    return false;
  } else {
    return res
  }
}

function nlpToResult(nlp) {
  console.log(nlp)
  var isq = isQuestion(nlp);
  return {
    bucket: BUCKET.search,

  }
}

// shit this is hard
function isQuestion(nlp) {
  if (nlp.parts_of_speech[nlp.parts_of_speech.length - 1][0] === '?') {
    return true;
  }

  // some questions start off with verbs like "is, are, does"
  for (var i = 0; i < nlp.parts_of_speech.length; i++) {
    if (i[1] === 'INTJ') {
      continue;
    } else if ('is,are,does,which'.indexOf(i[0]) >= 0) {
      return true;
    } else {
      break;
    }
  }

  return false;
}

if (!module.parent) {
  var sentences = [
    'find me a coffee machine',
    'search luxury socks',
    'like the frist one but not so derpy',
    'kip find me running leggings',
    'like the first one but orange',
    'does the first one have pockets?',
    'yes please',
    'do you have B but in blue',
    'please show brighter blue i don\'t like dark colour',
    'hmm I really like C what\'s the fabric?',
    'ok pls buy for me thanks',
    'looking for a black zara jacket',
    'I like the thrid one',
    'is there any size medium?'
  ];
  new qtypes(function(q) {
    question = q;
    debug('loaded qtypes')
    sentences.map(function(a) {
      parse(a, function(e, res) {
        if (e) {
          console.error(e);
        } else {
          console.log(a);
          console.log(res);
        }
      })
    })
  })
} else {
  new qtypes(function(q) {
    question = q;
    debug('loaded qtypes')
    console.log('NLP ready')
  })
}

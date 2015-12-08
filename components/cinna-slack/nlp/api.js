var request = require('request')
var config = require('config')
// var normalize = require('node-normalizer')
// var qtypes = require('qtypes')

var debug = require('debug')('nlp')

var BUCKET = {
  search: 'search',
  banter: 'banter',
  purchase: 'purchase'
}

var ACTION = {
  initial: 'initial',
  similar: 'similar',
  modify: 'modify',
  focus: 'focus',
  more: 'more',
  back: 'back',
  save: 'save',
  checkout: 'checkout',
  remove: 'remove',
  list: 'list'
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

  // check for exact matches
  var res = exactMatch(text);
  if (res) {
    debug('found exact match')
    return callback(null, res)
  }

  // check for easy regex matches
  var simpleResult = quickparse(text);
  if (simpleResult) {
    debug('found simple result')
    return callback(null, simpleResult)
  }

  var normalizedText = text; //normalize.clean(text); // TODO might take too long (70ms)
  debug('normalized:', normalizedText)

  // var qtype = question.classify(normalizedText);
  // debug('qtype:', qtype)

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
      var res = nlpToResult(b);
      res.tokens = [text]
      debug(res)
      return callback(null, res);
    }
  })
}


var exactMatches = {
  more: {bucket: BUCKET.search, action: ACTION.more, tokens: ['more']},
  get: {bucket: BUCKET.purchase, action: ACTION.checkout, tokens: ['get']},
  checkout: {bucket: BUCKET.purchase, action: ACTION.checkout, tokens: ['checkout']},
  cart: {bucket: BUCKET.purchase, action: ACTION.list, tokens: ['cart']},
  'view cart': {bucket: BUCKET.purchase, action: ACTION.list, tokens: ['view cart']}
}

function exactMatch(text) {
  // clean the text
  text = text.toLowerCase().replace(/[],:;.!?]/, '').trim();
  return exactMatches[text];
}

/**
 * checks for really simple cases which won't require nlp
 */
function quickparse(text) {
  // remove a leading "kip" ("kip find me socks" --> "find me socks")
  text = text.replace(/^kip[,:;.! ]/i, '')
  var res = {
    bucket: BUCKET.search,
    tokens: text
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
      // /more like ([\n])/i,
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
        case ACTION.more:
          res.tokens = text;
          break;
      }
    })
  })

  if (!found) {
    return false
  } else {
    return res
  }
}

function nlpToResult(nlp) {
  debug(nlp)

  // check for more
  if (nlp.focus.length === 1) {
    for (var i = 0; i < nlp.parts_of_speech.length; i++) {
      if (nlp.parts_of_speech[i][0] === 'more') {
        debug('"more"')
        return {
          bucket: BUCKET.search,
          action: ACTION.similar,
          searchSelect: nlp.focus,
        }
      }
    }
  }

  // simple case
  if (nlp.ss.length === 1) {
    var s = nlp.ss[0];
    if (!s.isQuestion) {
      debug('simple case');
      return {
        bucket: BUCKET.search,
        action: ACTION.initial,
        tokens: [nlp.text]
      }
    }
  }

  // parse out the focused element for each sentence
  // if there is an ordinal, that's the focus



  // break out the entities into stores, locations, etc
  nlp.locaitons = [];
  nlp.entities.map(function(e) {
    if (e[1] === 'GPE') {
      nlp.locations.push(e[0])
    }
  })

  debug('returning at the end');
  return {
    bucket: BUCKET.search,
    action: ACTION.initial,
    tokens: [nlp.text]
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
  request(config.nlp + '/reload')
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
} else {
}

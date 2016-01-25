var request = require('request')
var config = require('config')
// var normalize = require('node-normalizer')
// var qtypes = require('qtypes')
var colors = require("./colors")
var materials = require('./materials')
var sizes = require('./sizes')
var brands = require('./brands')
var verbs = require('./verbs')
var price = require('./price')
var _ = require('lodash')
var stopwords = require('./stopwords');

var debug = require('debug')('nlp')



console.log(config)

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

  // First do some global hacks
  text = text.replace(' but blue', ' but in blue').replace(/[^\w\s,.$!]/gi, '')


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

  // Get help from TextBlob and spaCy python modules
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
      debug(res)
      return callback(null, res);
    }
  })
}


var exactMatches = {
  more: {bucket: BUCKET.search, action: ACTION.more, tokens: ['more']},
  'show more': {bucket: BUCKET.search, action: ACTION.more, tokens: ['show more']},
  get: {bucket: BUCKET.purchase, action: ACTION.checkout, tokens: ['get']},
  checkout: {bucket: BUCKET.purchase, action: ACTION.checkout, tokens: ['checkout']},
  cart: {bucket: BUCKET.purchase, action: ACTION.list, tokens: ['cart']},
  'view cart': {bucket: BUCKET.purchase, action: ACTION.list, tokens: ['view cart']},
  'show cart': {bucket: BUCKET.purchase, action: ACTION.list, tokens: ['show cart']},
  '1': {bucket: BUCKET.search, action: ACTION.focus, tokens: ['1'], searchSelect: [1]},
  '2': {bucket: BUCKET.search, action: ACTION.focus, tokens: ['2'], searchSelect: [2]},
  '3': {bucket: BUCKET.search, action: ACTION.focus, tokens: ['3'], searchSelect: [3]}
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
      /^can you find me a\b/i,
      /^can you find me\b/i,
      /^find me a\b/i,
      /^find me\b/i,
      /^find\b/i,
      /^search for a\b/i,
      /^search for\b/,
      /^search\b/i,
      /^i need a\b/i,
      /^i need\b/i
    ],
    // modify: [
      //  /^more\ ([\w ])+/
    //   /\bin (.+)\b/i,
    //   /\bwith (.+)\b/i
    // ],
    similar: [
      // /more like ([\n])/i,
      // /like the ([\w]+)\b/i
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
          res.tokens = [text];
          break;
        case ACTION.modify:
          // capture the modifier
          var match = text.match(re);
          if (match[1]) {
            res.dataModify = getModifier(match[1])
          }
          res.tokens = [text]
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

function getModifier(text) {
  debug('getting dataModify object for ' + text)
  if (colors.isColor(text)) {
    return {
      type: 'color',
      val: colors(text)
    }
  }

  if (materials.isMaterial(text)) {
    return {
      type: 'material',
      val: [text]
    }
  }

  if (sizes.isSize(text)) {
    return {
      type: 'size',
      val: [text]
    }
  }

  if (brands.isBrand(text)) {
    return {
      type: 'brand',
      val: [text]
    }
  }

  return {
    type: 'genericDetail',
    val: [text]
  }
}


/*
input be like:
{ adjectives: [ 'cheapest' ],
  entities: [ [ '32', 'CARDINAL' ] ],
  focus: [],
  nouns: [ 'monitor' ],
  parts_of_speech: [ [ 'cheapest', 'ADJ' ], [ '32', 'NUM' ], [ '"', 'PUNCT' ], [ 'monitor', 'NOUN' ] ],
  ss: [ { focus: [], isQuestion: false, noun_phrases: [], parts_of_speech: [Object], sentiment_polarity: 0, sentiment_subjectivity: 0 } ],
  text: 'cheapest 32" monitor',
  verbs: [] }}
*/
function nlpToResult(nlp) {
  debug(nlp)

  /*
  THIS ISN'T EVEN MY FINAL FORM
  {
      bucket: 'search',
      action: 'aggregate',
      tokens: ['cheapest 32" monitor with good reviews'],
      execute: [ //will fire commands in arr order
        {
          bucket: 'search', //initial search
          action:'initial',
          val: '32" monitor'
        },
        {
          bucket: 'search', //sorts cheapest
          action:'modify',
          dataModify: {
            type: 'price',
            param: 'less' //or 'more'
          }
        },
        {
          bucket: 'search', //sorts top reviews
          action:'modify',
          dataModify: {
            type: 'reviews',
            param: 'top' //or 'more'
          }
        }
      ]
    }
  */
  var res = {
    tokens: [nlp.text],
    execute: []
  };

  // add focus
  nlp.focus = nlp.focus || [];
  if (nlp.focus[0]) {
    res.searchSelect = nlp.focus;
  }

  // take care of invalid adjectives that are actually focuses (first)
  nlp.adjectives = nlp.adjectives || [];
  var invalidAdjectives = ['first', 'second', 'third'];
  nlp.adjectives = nlp.adjectives.filter(function(a) {
    return invalidAdjectives.indexOf(a.toLowerCase()) < 0;
  })

  // take care of invalid nouns
  nlp.nouns = (nlp.nouns || []).filter(function(n) {
    return stopwords.indexOf(n.toLowerCase()) < 0;
  })

  // handle all initial search requests first
  if (nlp.focus.length === 0) {

  }

  // check for "about"
  if (nlp.focus.length === 1) {
    if (nlp.text.indexOf('about') >= 0) {
      debug('about triggered')
      res.bucket = BUCKET.search;
      res.action = ACTION.focus;
      return res;
    }
  }

  // check for "more"
  if (nlp.focus.length >= 1) {
    for (var i = 0; i < nlp.parts_of_speech.length; i++) {
      if (nlp.parts_of_speech[i][0] === 'more') {
        debug('more triggered')
        res.bucket = BUCKET.search;
        res.action = ACTION.similar;
        return res;
      }
    }
  }

  if (nlp.verbs.length === 1 && verbs.getAction(nlp.verbs[0])) {
    debug('verbs.getAction triggered')
    res.action = verbs.getAction(nlp.verbs[0])
    res.bucket = verbs.getBucket(nlp.verbs[0])
    return res;
  }

  if (nlp.ss.length === 1 && nlp.focus.length === 0) {
    var s = nlp.ss[0];
    if (!s.isQuestion) {
      debug('simple case initial triggered');
      res.execute.push({
        bucket: BUCKET.search,
        action: ACTION.initial,
        val: _.uniq(nlp.nouns.join(' ').split(' ').filter(function(n) {
          return stopwords.indexOf(n) < 0;
        })).join(' ')
      })
    }
  }


  var priceModifier = price(nlp.text);
  if (priceModifier) {
    debug('priceModifier triggered')
    res.execute.push({
      bucket: BUCKET.search,
      action: ACTION.modify,
      dataModify: priceModifier
    })
  }

  // get all the nouns and adjectives
  var modifierWords = _.uniq(nlp.nouns.concat(nlp.adjectives));

  // if there is a focus and a modifier, it's a modified search
  if (nlp.focus.length === 1 && modifierWords.length === 1 && res.execute.length == 0) {
    debug('single focus, single modifier triggered')
    res.bucket = BUCKET.search;
    res.action = ACTION.modify;
    res.dataModify = getModifier(modifierWords[0]);
    res.execute = [];
    return res;
  }

  // break out the entities into stores, locations, etc
  nlp.locations = [];
  nlp.entities.map(function(e) {
    if (e[1] === 'GPE') {
      nlp.locations.push(e[0])
    }
  })

  if (nlp.isQuestion) {
    debug('its a question')
  }

  debug('returning at the end');
  return res;
}


//
// for testing
//
if (!module.parent) {
  request(config.nlp + '/reload')

  if (process.argv.length > 2) {
    parse(process.argv.slice(2).join(' '), function(e, r) {
      if (e) debug(e)
      console.log(JSON.stringify(r, null, 2))
      process.exit(0);
    });
  } else {

  var sentences = [
    'find me a coffee machine',
    'search luxury socks',
    'kip find me running leggings',
    'like the first one but orange',
    'do you have 2 but in blue',
    'please show brighter blue i don\'t like dark colour',
    'looking for a black zara jacket',
    'I like the thrid one',
    // 'is there any size medium?',
    'like 2 but blue',
    // 'does it have pockets?',
    'morning glory (24 pack)',
    'cheapest 32" monitor',
    'i need a 3d camera',
    '3 but 8 axis',
    '2 but more fun',
    '1 but green', // this is returning lime?
    '2 but blue',
  ];
  sentences.map(function(a) {
    parse(a, function(e, res) {
      if (e) {
        console.error(e);
      } else {
        console.log(a);
        console.log(JSON.stringify(res, null, 2));
      }
    })
  })
}
}

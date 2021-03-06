var request = require('request-promise')
var co = require('co');
var _ = require('lodash')
var debug = require('debug')('nlp')

var config = require('../config')
var colors = require("./colors")
var materials = require('./materials')
var sizes = require('./sizes')
var brands = require('./brands')
var verbs = require('./verbs')
var price = require('./price')
var stopwords = require('./stopwords');

var MODE = {
  shopping: 'shopping',
  smalltalk: 'smalltalk',
  cart: 'cart'
}

var ACTION = {
  initial: 'initial',
  similar: 'similar',
  modify: 'modify',
  modifyone: 'modify.one',
  modifyall: 'modify.all',
  focus: 'focus',
  more: 'more',
  back: 'back',
  save: 'save',
  checkout: 'checkout',
  remove: 'remove',
  list: 'list'
}

/**
 * Call this with the message like message schema.
 sampleRes = {
        mode: 'search',
        action: actionS, //initial, similar, modified, focus, more, back
        focus: [1,2,3], //which item for search select
        tokens: msg,
        channel: '3EL18A0M' //example of slack channel (the user who is chatting) --> please send back from python
    };
  */
var parse = module.exports.parse = function(message) {
  return co(function*() {
    var text = message.text;
    debug('parsing:' + text)

    // First do some global hacks
    text = text.replace(' but blue', ' but in blue').replace(/[^\w\s,.$!]/gi, '')

    // check for easy regex matches
    var simpleResult = quickparse(text);
    if (simpleResult) {
      debug('found simple result')
      message.execute = [simpleResult];
      return simpleResult;
    }


    // Get help from TextBlob and spaCy python modules
    var res = yield request({
      method: 'POST',
      url: config.nlp + '/parse',
      json: true,
      body: {
        text: text
      }
    });


    // welp we'll mutate the shit out of the message here.
    nlpToResult(res, message);
    return message;
  })
}

/**
 * checks for really simple cases which won't require nlp
 */
function quickparse(text) {
  // remove a leading "kip" ("kip find me socks" --> "find me socks")
  text = text.replace(/^kip[,:;.! ]/i, '')

  // check for initial search queries
  regexes = [{
    mode: 'shopping',
    action: 'initial',
    regexes: [
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
    ]
  }, {
    mode: 'cart',
    action: 'view',
    regexes: [
      /^view cart\b/i,
      /^cart$/i,
      /^checkout/i,
      /^check out/i
    ]
  }, {
    mode: 'cart',
    action: 'empty',
    regexes: [
      /^empty cart\b/i,
      /^delete cart\b/i
    ]
  }];

  var result = false;
  regexes.map(function(handler) {
    if (result) {
      return;
    }

    for (var i = 0; i < handler.regexes.length; i++) {
      var re = handler.regexes[i];
      if (text.match(re)) {
        result = {
          mode: handler.mode,
          action: handler.action
        };

        if (handler.action === 'initial') {
          result.params = {
            query: text.replace(re, '').trim()
          }
        }

        return;
      }
    }
  })

  return result;
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
function nlpToResult(nlp, message) {
  debug(nlp)

  nlp.focus = nlp.focus || [];

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

  // check for "about"
  if (nlp.focus.length === 1) {
    if (nlp.text.indexOf('about') >= 0) {
      debug('about triggered')
      message.execute.push({
        mode: MODE.shopping,
        action: ACTION.focus,
        params: {focus: nlp.focus[0]}
      })
      return
    }
  }

  // check for "more"
  if (nlp.focus.length >= 1) {
    for (var i = 0; i < nlp.parts_of_speech.length; i++) {
      if (nlp.parts_of_speech[i][0] === 'more') {
        debug('more triggered')
        message.execute.push({
          mode: MODE.shopping,
          action: ACTION.similar,
          params: { focus: nlp.focus[0]}
        })
        return;
      }
    }
  }

  if (nlp.verbs.length === 1 && verbs.getAction(nlp.verbs[0])) {
    debug('verbs.getAction triggered')
    var exec = {
      mode: verbs.getMode(nlp.verbs[0]),
      action: verbs.getAction(nlp.verbs[0])
    }

    if (nlp.focus.length >= 1) {
      exec.params = {focus:  nlp.focus[0]};
    }
    message.execute.push(exec)
    return;
  }

  var priceModifier = price(nlp.text);
  if (priceModifier) {
    debug('priceModifier triggered')
    var exec = {
      mode: MODE.shopping,
      action: nlp.focus.length === 0 ? ACTION.modifyall : ACTION.modifyone,
      params: priceModifier,
    };
    if (nlp.focus.length >= 1) {
      exec.params.focus = nlp.focus[0];
    }
    message.execute.push(exec);
    return;
  }

  // get all the nouns and adjectives
  var modifierWords = _.uniq(nlp.nouns.concat(nlp.adjectives));

  // if there is a focus and a modifier, it's a modified search
  if (nlp.focus.length === 1 && modifierWords.length === 1 && message.execute.length == 0) {
    debug('single focus, single modifier triggered')
    var exec = {
      mode: MODE.shopping,
      action: ACTION.modifyone,
      params: getModifier(modifierWords[0])
    }
    exec.params.focus = nlp.focus;
    message.execute.push(exec);
    return;
  }

  // break out the entities into stores, locations, etc
  nlp.locations = [];
  nlp.entities.map(function(e) {
    if (e[1] === 'GPE') {
      nlp.locations.push(e[0])
    }
  })

  if (nlp.ss.length === 1 && nlp.focus.length === 0) {
    var s = nlp.ss[0];
    if (!s.isQuestion) {
      debug('simple case initial triggered');
      message.execute.push({
        mode: MODE.shopping,
        action: ACTION.initial,
        params: {
          query: _.uniq(nlp.nouns.join(' ').split(' ').filter(function(n) {
            return stopwords.indexOf(n) < 0;
          })).join(' ')
        }
      })
    }
  }

  // take care of any extraneous modify parameters
  message.execute.map(e => {
    if (e.action === ACTION.modify) {
      e.action = typeof _.get(e, 'params.focus[0]') === 'undefined' ? ACTION.modifyall : ACTION.modifyone;
    }
  });

  if (nlp.isQuestion) {
    debug('its a question')
  }

  debug('returning at the end');
  return;
}


//
// for testing
//
if (!module.parent) {
  require('colors')
  console.log('testing nlp api');
  request(config.nlp + '/reload')

  if (process.argv.length > 2) {
    var m = {
      text: process.argv.slice(2).join(' '),
      execute: [],
    }
    parse(m).then(r => {
      console.log(JSON.stringify(r, null, 2))
      process.exit(0);
    }, e => {
      console.log(e.stack);
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
      // 'like 2 but blue',
      // 'does it have pockets?',
      'morning glory (24 pack)',
      'cheapest 32" monitor',
      'i need a 3d camera',
      '3 but 8 axis',
      '2 but more fun',
      // '1 but green', // this is returning lime?
      // '2 but blue',
    ];
    sentences.map(function(a) {
      a = {
        text: a,
        execute: []
      };
      parse(a).then(function(res) {
        console.log(a.text.cyan);
        console.log(JSON.stringify(res, null, 2));
      }, e => {
        console.log(e.stack);
      })
    })
  }
}
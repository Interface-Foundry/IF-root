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
    var history_array = [];
    for (var i = 0; i < message.history.length; i++){
      history_array.push(message.history[i].source.text)
    }
    debug('hist_array**'.cyan, history_array)

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


    // using parser and res_rnn
    var res_parse = yield request({
      method: 'POST',
      url: config.nlp + '/parse',
      json: true,
      body: {
        text: text,
        history: history_array
      }
    });

    var res_rnn = yield request({
      method: 'POST',
      url: config.nlp_rnn + '/predict',
      json: true,
      body: {
        text: text,
        history: history_array
      }
    })


    // welp we'll mutate the shit out of the message here.
    nlpToResult(res_parse, message);
    return message;
  })
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


function nlpUsingRNN(nlp, message) {
  debug('using new deep learning'.cyan, nlp)

  message.execute.push({
  mode: nlp.MODE,
  action: nlp.ACTION,
  params: {
    query: ;
  }
})
}
/*
input be like:
{ adjectives: [ 'cheapest' ],
  entities: [ [ '32', 'CARDINAL' ] ],
  focus: [],
  nouns: [ 'monitor' ],
  parts_of_speech: [ [ 'cheapest', 'ADJ' ], [ '32', 'NUM' ], [ '"', 'PUNCT' ], [ 'monitor', 'NOUN' ] ],
  ss: [ { focus: [], had_question: false, noun_phrases: [], parts_of_speech: [Object], sentiment_polarity: 0, sentiment_subjectivity: 0 } ],
  text: 'cheapest 32" monitor',
  verbs: [] }}
*/
function nlpToResult(nlp, rnn, message) {
  debug(nlp)

  nlp.focus = nlp.focus || [];

  // take care of invalid adjectives that are actually focuses (first)
  nlp.adjectives = nlp.adjectives || [];
  var invalidAdjectives = ['first', 'second', 'third'];
  nlp.adjectives = nlp.adjectives.filter(function(a) {
    return invalidAdjectives.indexOf(a.toLowerCase()) < 0;
  })

  // take care of invalid nouns - removed for now
  nlp.nouns = (nlp.nouns || []).filter(function(n) {
    return stopwords.indexOf(n.toLowerCase()) < 0;
  })

  // handle all initial search requests first
  if (nlp.focus.length === 0) {

  }

  // check for "about"

  if (nlp.had_about == true) {
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
  if (nlp.had_more == true) {

    if (nlp.ss.had_more == 'True') {
      debug('more triggered')
      message.execute.push({
        mode: MODE.shopping,
        action: ACTION.similar,
        params: { focus: nlp.focus[0]}
      })
      return;
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

  if (nlp.ss.length === 1 && nlp.focus.length === 0) {
    var s = nlp.ss[0];
    if (!s.had_question) {
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

  // var priceModifier = price(nlp.text);
  if (nlp.price_modifier) {
    debug('priceModifier triggered')
    var exec = {
      mode: MODE.shopping,
      action: nlp.focus.length === 0 ? ACTION.modifyall : ACTION.modifyone,
      params: nlp.price_modifier,
    };
    if (nlp.focus.length >= 1) {
      exec.params.focus = nlp.focus[0];
    }
    message.execute.push(exec);
  }

  // get all the nouns and adjectives
  // var modifierWords = _.uniq(nlp.nouns.concat(nlp.adjectives));

  // if there is a focus and a modifier, it's a modified search
  if (nlp.focus.length === 1 && modifierWords.length === 1 && message.execute.length == 0) {
    debug('single focus, single modifier triggered')
    var exec = {
      mode: MODE.shopping,
      action: ACTION.modifyone,
      params: getModifier(nlp.modifier_words)
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

  // take care of any extraneous modify parameters
  message.execute.map(e => {
    if (e.action === ACTION.modify) {
      e.action = typeof _.get(e, 'params.focus[0]') === 'undefined' ? ACTION.modifyall : ACTION.modifyone;
    }
  });

  if (nlp.had_question) {
    debug('its a question')
  }

  debug('returning at the end');
  return;
}

// --------------------------------------------------------
// saved function from peter
// --------------------------------------------------------


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
'use strict'
var _ = require('lodash')
var debug = require('debug')('nlp')
var amazonHTML = require('../chat/components/amazonHTML')
var kip = require('kip')

// dec2vec size of embedding vectors
const VEC_SIZE = 300;

// A sentence object has two parts:
//  the original string
//  an embedding which is a unit vector from doc2vec
const defaultSentence = {
  string: '',
  embedding: Array.apply(null, Array(VEC_SIZE)).map(function(){ return 0 })
}

// struct for sources from which we find answers to questions posed by users.
const defaultSource = {
  descriptionSentences: [],
  answeredQuestions: [],
  reviews: []
};

// these are questions answered by people on the product description page
const defaultAnsweredQuestion = {
  q: defaultSentence,
  a: [defaultSentence]
}

/**
 * Answers questions about products
 */
module.exports = function(question, productUrl, callback) {
  debug(question)
  debug(productUrl)
  if (!question) {
    kip.err('cannot answer a null question')
    return callback(new Error('null question'))
  } else if (!productUrl) {
    kip.err('cannot answer question without the product url');
    return callback(new Error('null productUrl'))
  }

  // this is the fun part where we fetch all the data we need to answer the question
  // would be neat to use some new async control flow mechanism, but i'll use callbacks
  getAmazonStuff(productUrl, function(err, source) {
    // Find the closest question and see if it's relevant
    var bestQuestion = _.sortBy(source.answeredQuestions.map(function(qa) {
      qa.questionDistance = cosineSimilarity(question.embedding, qa.q.embedding)
    }), 'questionDistance')[0];

    if (bestQuestion.questionDistance > 0.5) {
      return callback(null, bestQuestion.a[0].string)
    }

    // default answer
    callback(null, '42')

  })

}

/**
 * Assumes vectors are same length
 * Assumes vectors are of unit magnitude
 */
function cosineSimilarity(v1, v2) {
    return v1.reduce(function(sum, val, i) {
      return sum + val * v2[i];
    }, 0)
}

/**
 * Gets the stuff from A_m_A_z_O_n_._c_O_m
 */
function getAmazonStuff(url, callback) {
  debug(url);
  amazonHTML.basic(url, function (err, product) {
    debug('got product from amazonHTML')
    if (kip.err(err) || !product) {
      console.error('could not get product for url ' + url);
      return callback(null, defaultSource)
    }

    // split the description text into sentences
    var desc = (product.text || '')
      .replace(/[.]/g, '.')
      .split(/[]/);

    var source = _.merge({}, {descriptionSentences: desc})
    amazonHTML.qa(url, function(err, qa) {
      if(kip.err(err)) {
        return callback(null, source)
      }

      debug('got answered questions from amazonHTML')
      source.answeredQuestions = qa;
      callback(null, source)
    })
  })
}

if (!module.parent) {
  var items = [
    {
      url: 'http://www.amazon.com/gp/product/B00R8NSSGK/ref=s9_aas_bw_g193_i3?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-4&pf_rd_r=1YSQG3YFK2RM66XKNQ9C&pf_rd_t=101&pf_rd_p=2337894602&pf_rd_i=13429645011',
      _description: 'puma pants',
      questions: [
        'Does it have pockets?'
      ]
    },
    {
      url: 'http://www.amazon.com/dp/B00BGO0Q9O/ref=s9_acsd_bw_wf_s_NRwaterf_cdl_5?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-top-3&pf_rd_r=1648MF65W33MBPQPSZSJ&pf_rd_t=101&pf_rd_p=2058449622&pf_rd_i=10711515011',
      _description: 'fitbit',
      questions: [
        'does it have an alarm?',
        'will it work with zumba?'
      ]
    }
  ];

  items.map(function(i) {
    i.questions.map(function(q) {
      module.exports(q, i.url, function(err, answer) {
        kip.fatal(err);
        console.log(i._description.cyan + ' : ' + q)
        console.log(answer)
      })
    })
  })
}

'use strict'
var _ = require('lodash')
var debug = require('debug')('nlp')
var amazonH = require('../chat/components/amazonHTML')

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
  if (!question) {
    kip.err('cannot answer a null question')
    return callback(new Error('null question'))
  } else if (!productUrl) {
    kip.err('cannot answer question without the product url');
    return callback(new Error('null productUrl'))
  }

  // this is the fun part where we fetch all the data we need to answer the question
  // would be neat to use some new async control flow mechanism, but i'll use callbacks
  getAmazonStuff(productUrl, function(source) {
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
  amazonHTML.basic(url, function (err, product) {
    if (kip.err(err) || !product) {
      console.error('could not get product for url ' + url);
      return callback(defaultSource)
    }

    // split the description text into sentences
    var desc = (product.text || '')
      .replace(/[.]/g, '.')
      .split(/[]/);

    var source = _.merge({}, {descriptionSentences: desc})



  })
}

if (!module.parent) {
  console.log('✓')
}

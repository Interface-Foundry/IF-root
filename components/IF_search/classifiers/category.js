var db = require('db');
var natural = require('natural');
var kip = require('kip');
require('colors');
require('vvv');
var _ = require('lodash');

// make the trainnig and test sets
var trainingSet = require('./categoryTrainingSet').map(function(item) {
  return {
    _id: item._id,
    text: [item.description, item.price].join(' '),
    tag: item.tag,
    url: item.linkback
  }
})
trainingSet = _.shuffle(trainingSet);
var testSet = trainingSet.splice(0, trainingSet.length/20|0);

// classify jsut the particular specific item column
var classifier = new natural.BayesClassifier();

var trainedTags = {};
trainingSet.map(function(t) {
  log.v('adding document ' + t._id)
  classifier.addDocument(t.text, t.tag);
  trainedTags[t.tag] = trainedTags[t.tag] || 0;
  trainedTags[t.tag]++;
})

console.log('training with tags:', JSON.stringify(trainedTags, null, 2));

classifier.train();
console.log('done training');

classifier.save('./item_classifier.json', function(e) {
  kip.ohshit(e);
})

// now test the classification
var successful = 0;
var failed = 0;
var T = {}; // actual
var P = {}; // predicted
testSet.map(function(t) {
  log.vvv('classifying ' + t._id);
  log.vvv(t.text);

  // log the actual tag
  T[t.tag] = T[t.tag] || 0;
  T[t.tag]++;

  // predict
  var tag = classifier.classify(t.text);

  // log predicted tag
  P[tag] = P[tag] || {count: 0, original: {}};
  P[tag].count++;

  log.v(tag + ' ' + t.url);
  if (t.tag === tag) {
    log.v('successful'.green + ' ' + t._id);
    successful++;
  } else {
    log.v('failed'.red + ' ' + t._id);
    P[tag].original[t.tag] = P[tag].original[t.tag] || 0;
    P[tag].original[t.tag]++;
    failed++;
  }
})

console.log('classifier ' + (successful * 100 / (successful + failed)) + '% successful');
console.log('actual', JSON.stringify(T, null, 2));
console.log('predicted', JSON.stringify(P, null, 2));

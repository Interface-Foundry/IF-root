var db = require('db');
var natural = require('natural');
var kip = require('kip');
require('colors');
require('vvv');
var _ = require('lodash');

// make the trainnig and test sockets
var trainingSet = require('./trainingSet').map(function(item) {
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

//
trainingSet.map(function(t) {
  log.v('adding document ' + t._id)
  classifier.addDocument(t.text, t.tag);
})

console.log('training classifier');
classifier.train();
console.log('done training');

classifier.save('./item_classifier.json', function(e) {
  kip.ohshit(e);
})

// now test the classification
var successful = 0;
var failed = 0;
var shirts = 0;
var dresses = 0;
testSet.map(function(t) {
  log.vvv('classifying ' + t._id);
  log.vvv(t.text);
  var tag = classifier.classify(t.text);
  if (tag === 'shirt') {
    shirts++;
  } else if (tag === 'dress') {
    dresses++;
  }
  log.v(tag + ' ' + t.url);
  if (t.tag === tag) {
    log.v('successful'.green + ' ' + t._id);
    successful++;
  } else {
    log.v('failed'.red + ' ' + t._id);
    failed++;
  }
})

console.log('classifier ' + (successful * 100 / (successful + failed)) + '% successful');
console.log(shirts, 'shirts')
console.log(dresses, 'dresses')

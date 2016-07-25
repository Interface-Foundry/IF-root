var db = require('db');
var fs = require('fs');
var natural = require('natural');
var kip = require('kip');
var _ = requrie('lodash');
require('colors');

//
// Binary classifier.  1/0, yes/no it is a dress, it is not a dress.
//

// helper function to find items from the db
function getTrainingSet(tag) {

}

// Trains a simple binary yes/no classifier
module.exports = function(tag) {
  // first create a training set
  getTrainingSet(tag, function(items) {
    items.map(function(i) {
      log.v('adding document ' + t._id)
      classifier.addDocument(t.text, t.tag);
      trainedTags[t.tag] = trainedTags[t.tag] || 0;
      trainedTags[t.tag]++;
    });

    console.log('training classifier');
    classifier.train();
    console.log('done training classifier');
    classifier.save(__dirname + '/' + tag + '_classifier.json', function(e) {
      kip.fatal(e);
    })
  })
}

var db = require('db');
var natural = require('natural');
var kip = require('kip');
require('colors');
require('vvv');
var searchterms = require('../searchterms');
var _ = require('lodash');

var classifierPath = __dirname + '/item_classifier.json';

var tags = ['Dresses', 'Tops', 'Skirts', 'Pants'];
var tagTokens = searchterms.tokenize(tags.join(' '));

function getLandmarksToClassify(tag, cb) {

}

module.exports = function(tag, callback) {
  var classifierPath = __dirname + '/' + tag + '_classifier.json';
  if (!fs.existsSync(classifierPath)) {
    console.log("FATAL ERROR CODE 99084:ECLSNFND");
    console.log('make sure that', classifierPath, 'exists');
    console.log('if you need to create it, run bindary_trainer.js with', tag);
    return;
  }

  // load the saved classifier
  natural.BayesClassifier.load(classifierPath, null, function(err, classifier) {
    console.log('loaded classifer', classifierPath);

    setInterval(function() {
      getLandmarksToClassify(tag, function(e, items) {
        if (e) { return callback(e) }
        if (items.length === 0) {
          console.log('done')
          callback();
        }

      })
      db.Landmarks.find({
        world: false,
        'flags.classifierCategoryDone': {$ne: true}
      })
        .select('name description price itemTags')
        .limit(100)
        .exec(function(e, items) {
          kip.fatal(e);
          if (items.length === 0) {
            console.log('done')
            process.exit(0);
          }
          items.map(function(i) {
            var text = [
              i.name,
              i.description,
              i.price
            ].join(' ');
            var tag = classifier.classify(text);
            console.log('tagged', i.name, 'as', tag);
            i.flags.classifierCategoryDone = true;
          })

            // make a decision on whether or not that is correct
            var shouldtag = true;

            // tag is probably invalid if the name contains a different item
            tagTokens.map(function(t) {
              if (t === searchterms.tokenize(tag)[0]) { return }

              if (searchterms.tokenize(i.name).indexOf(t) >= 0) {
                shouldtag = false;
                console.log('Probably in incorrect tag'.red);
              }
            })

            // do all the taggy things
            if (shouldtag) {
              // remove any of the other tags that might be present
              // (like if we tag as Dress, remove Skirt)

              i.itemTags.categories = i.itemTags.categories.filter(function(t) {
                return tags.indexOf(tag) >= 0;
              });

              i.itemTags.text = i.itemTags.categories.filter(function(t) {
                return tags.indexOf(tag) >= 0;
              })

              i.itemTags.categories.push(tag);
              i.itemTags.text.push(tag);
              i.meta.classifiedCategory = tag;
            }
            i.save();
          })
        })
      }, 3000)
  })
}

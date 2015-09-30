var db = require('db');
var searchterms = require('../searchterms');
var _ = require('lodash');
var get = _.get;
var kip = require('kip');

/*
first pass; simple text search and tagging
*/
function processItem() {
  db.Landmarks.find({
    world: false,
    'flags.classifierFirstPassDone': {$ne: true}
  })
  .limit(100)
  .exec(function(e, l) {
    kip.ohshit(e);
    if (!l || !l.length) {
      console.log('done');
      process.exit(0);
    }

    l.map(function(i) {

      // classifierTags = ['ugli', 'christma', 'sweater'];  (special tokenized)
      i.meta.classifierTags = _.uniq(searchterms.tokenize(_.flattenDeep([
        i.name,
        i.description,
        i.itemTags.categories,
        i.itemTags.text,
        i.itemTags.colors
      ]).join(' ')).filter(function(word) {
        return searchterms.buckets.reduce(function(ok, b) {
          return ok || b.words.indexOf(word) >= 0;
        }, false);
      }))
      console.log(get(i, 'meta.classifierTags').join(' '));
      i.flags.classifierFirstPassDone = true;
      i.flags.mustUpdateElasticsearch = true;
      i.save();
    })
  })
}

setInterval(function() {
  processItem()
}, 1000);

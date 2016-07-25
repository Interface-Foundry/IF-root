var db = require('db');
var request = require('request');
require('vvv');
var Promise = require('bluebird');
var CloudsightAPI = require('./cloudsightAPI');
var cloudsight = new CloudsightAPI({
  key: 'cbP8RWIsD0y6UlX-LohPNw'
});

/**
 * this function processes items until there are no more items to process
 * then it enters the coldwait function, which polls the db every so often
 */
function processItem() {
  db.Landmarks.findOne({
    world: false,
    'flags.cloudsightProcessed': {$ne: true}
  }, function(e, l) {
    if (e) {
      console.error(e);
      process.exit(1);
    }
    if (!l) {
      return coldwait();
    }

    log.v(l);

    // we can't do image tagging if there's no image
    if (!l.itemImageURL[0]) {
      console.log('no image url for landmark', l._id.toString());
      l.flags.cloudsightProcessed = true;
      l.save(function() {
        return setTimeout(processItem, 1000);
      })
    }

    log.v(l.itemImageURL[0]);

    cloudsight.get(l.itemImageURL[0], function (e, r) {
      if (e) {
        console.error('error hitting cloudsight api for landmark', l._id.toString());
        console.error(e);
        return setTimeout(processItem, 1000);
      }
      l.source_cloudsight = r;
      l.flags.cloudsightProcessed = true;
      l.flags.mustUpdateElasticsearch = true;
      l.save(function (e) {
        if (e) {
          console.error('error saving landmark');
          console.error(e);
          return setTimeout(processItem, 1000);
        }
        console.log('updated landmark', l._id.toString());
        return setTimeout(processItem, 1000);
      })
    })
  })
}

/**
 * this function polls the db for items to process, and then restarts
 * processItem() when more items to process show up
 */
function coldwait() {
  db.Landmarks.findOne({
    world: false,
    'flags.justVisualProcessed': {$ne: true}
  }, function(e, l) {
    if (e) {
      console.error(e);
      process.exit(1);
    }
    if (l) {
      process.nextTick(function() {
        processItem();
      })
    } else {
      setTimeout(function() {
        coldwait();
      }, 1000*60*10)
    }
  })
}

processItem();

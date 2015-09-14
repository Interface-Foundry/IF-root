var db = require('db');
var request = require('request');
require('vvv');
var saveJustVisual = require('./saveJustVisual');
var Promise = require('bluebird');

var APIKey = '4be034e1-01d7-41de-bd52-1feb2eedafe5';
var ftpUserName = '4be034e101d741debd521feb2eedafe5';
var ftpPassword = 'elJLjq4qGX';
var urlTemplate = 'http://style.vsapi01.com/api-search/by-url/?apikey=$KEY&url=$URL'
  .replace('$KEY', APIKey);

/**
 * this function processes items until there are no more items to process
 * then it enters the coldwait function, which polls the db every so often
 */
function processItem() {
  db.Landmarks.findOne({
    world: false,
    'flags.justVisualProcessed': {$ne: true}
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
      l.flags.justVisualProcessed = true;
      l.save(function() {
        return setTimeout(processItem, 1000);
      })
    }

    var url = urlTemplate.replace('$URL', l.itemImageURL[0])
    log.v(url);

    request({
      url: url,
      json: true
    }, function (e, r, b) {
      if (e) {
        console.error('error hitting api for landmark', l._id.toString());
        console.error(e);
        return setTimeout(processItem, 1000);
      }


      l.source_justvisual = l.source_justvisual || {};
      l.source_justvisual.images = b.images.map(function(i) {
        return i.id;
      });
      l.source_justvisual.keywords = b.keywords;
      l.flags.justVisualProcessed = true;
      l.flags.mustUpdateElasticsearch = true;

      var promises = b.images.map(function(i) {
        return saveJustVisual(i);
      })

      log.v('found', promises.length, 'images')

      Promise.settle(promises).then(function() {
        log.v('inserted just visual items');
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

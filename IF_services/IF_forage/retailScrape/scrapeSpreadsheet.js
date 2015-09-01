var quickflow = module.exports = require('quickflow')()

function startingPoint(data, done) {
// Gets the rows from the spreadsheet
var getRows = require('./getRows');
getRows().then(function(rows) {
  rows.map(function(r) {
    if (r.StoreName && r.StoreLat && r.StoreLon) {
      done(r)
    }
  })
})
}

function getItemUrls(data, done) {
var scrapers = require('./scrapers');

scrapers.scrapeSiteCatalog(data).then(function(urls) {
  urls.map(function(u) {
    done({
      row: data,
      url: u
    })
  })
})
}

function scrapeItem(data, done) {
var scrapers = require('./scrapers');
var db = require('db');
var accounting = require('accounting');
scrapers.scrapeItemDetail(data.url, data.row).then(function(fields) {
  if (!fields) {
    return
  }
  
  // check to see if there already in an item in here for it
  db.Landmarks.findOne({
    world: false,
    'source_generic_item.url': data.url
  }, function(e, item) {
    if (e) { throw new Error(e) }
    if (item) {
      // update it
      item.price = accounting.unformat(fields.ItemPrice) || item.price;
      item.priceRange = db.Landmarks.priceToPriceRange(item.price);
      item.description = fields.ItemDescription || item.description;
      item.name = fields.ItemName || item.name;
      item.itemTags.text = fields.ItemTags || item.itemTags.text;
    } else {
      // make a new landmark
      item = new db.Landmark({
        world: false,
        id: db.Landmark.generateIdFromName(fields.ItemName),
        name: fields.ItemName,
        valid: true,
        parent: {
          mongoId: data.row.store._id.toString(),
          name: data.row.store.name,
          id: data.row.store.name
        },
        owner: data.row.store.owner,
        loc: data.row.store.loc,
        description: fields.ItemDescription,
        source_generic_item: {
          url: data.url,
          ItemName: fields.ItemName,
          ItemPrice: fields.ItemPrice,
          ItemDescription: fields.ItemDescription,
          ItemImages: fields.ItemImages,
          RelatedItemURLs: fields.RelatedItemURLs,
          ItemTags: fields.ItemTags
        },
        price: accounting.unformat(fields.ItemPrice),
        priceRange: db.Landmarks.priceToPriceRange(fields.ItemPrice),
        itemImageURL: fields.ItemImages,
        linkback: data.url,
        linkbacknam: data.row.LinkbackName
      })
    }
    console.log(item);
    
    item.save(function(e, item) {
      if (e) { throw new Error(e) }
      
      data.item = item.toObject();
      done(data);
    });
  })
})
}

function log(data, done) {
// you don't even have to call done() if you don't want to
// all logging is up to you, so you don't have to rely on
// a complicated framework convention to make things work.
console.log(data)
}

function processImages(data, done) {
// i kind of forget what needs to happen here.
}

function getStoreFromRow(data, done) {
if (!data.StoreId) {
  throw new Error('no ID for store')
}

var db = require('db');

db.Landmarks.findOne({id: data.StoreId}, function(e, s) {
  if (e) throw e;
  if (s) {
    s.loc.coordinates = [parseFloat(data.StoreLon), parseFloat(data.StoreLat)];
    s.save(function() {
      data.store = s.toObject();
      done(data);
    })
    return
  }
  
  // uh oh have to make a new store aaaaand user for it
  var user = new db.User({
    addr: data.StoreAddress,
    name: data.StoreName,
    profileID: data.StoreId
  })
  user.save();
  var store = new db.Landmark({
    name: data.StoreName,
    id: data.StoreId,
    world: true,
    owner: {
      mongoId: user._id.toString(),
      profileID: user.profileID,
      name: user.name
    },
    valid: true,
    loc: {
      type: 'Point',
      coordinates: [parseFloat(data.StoreLon), parseFloat(data.StoreLat)]
    },
    addressString: data.StoreAddress
  })
  store.save();
  data.store = store.toObject();
  done(data);
})
}

quickflow.connect(startingPoint, getStoreFromRow)
quickflow.connect(getItemUrls, scrapeItem)
quickflow.connect(scrapeItem, log)
quickflow.connect(scrapeItem, processImages)
quickflow.connect(getStoreFromRow, getItemUrls)
if (!module.parent) quickflow.run()
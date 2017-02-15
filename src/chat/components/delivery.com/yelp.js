var Yelp = require('node-yelp');
var oa = require('./yelp_const');

var yelp = Yelp.createClient({
  oauth: {
    "consumer_key": oa.consumer_key,
    "consumer_secret": oa.consumer_secret,
    "token": oa.token,
    "token_secret": oa.token_secret
  }
});

function * yelpRestaurant (merch) {
  console.log('calling yelpRestaurant')
  if (!merch.yelp_info.rating.business_id) return merch.summary.url.complete;
  else {
    var resto = yield yelp.business(String(merch.yelp_info.rating.business_id))
    console.log('resto.businesses.length', resto)
    return resto.url
  }
}

module.exports = yelpRestaurant;

var db = require('db')
var _ = require('lodash')

module.exports = {};

//
// Add an item to the db
//
module.exports.addToTeamCart = function(team_id, user_id, item) {
  console.log('adding item to team cart ' + team_id)
  console.log(item);
  console.log(item.ItemLinks[0].ItemLink)
  var i = new db.Item({
    ASIN: item.ASIN[0],
    title: item.ItemAttributes[0].Title,
    link: item.ItemLinks[0].ItemLink[0].URL[0], // so obviously converted to json from xml
    image: item.altImage,
    price: item.realPrice,
    rating: item.reviews.rating,
    review_count: item.reviews.reviewCount,
    added_by: user_id,
    team: team_id,
    source_json: JSON.stringify(item)
  });

  i.save(function(e) {
    if (e) {
      console.log('error saving item to database:')
      console.log(JSON.stringify(item, null, 2));
      console.log(e);
    }
  })
}

//
// Syncs cart with amazon and returns a nicely formatted object
//
module.exports.getTeamCart = function(team_id, cb) {
  console.log('getting team cart for ' + team_id)
  console.log('syncing mongodb with amazon cart')
  /*
  example amazon cart
  {"Request":[{"IsValid":["True"],"CartCreateRequest":[{"Items":[{"Item":[{"ASIN":["B0060E6CVG"],"Quantity":["1"]}]}]}]}],"CartId":["182-3610389-1151221"],"HMAC":["ao4WghbjnDwYstiGU3bN7fAnMds="],"URLEncodedHMAC":["ao4WghbjnDwYstiGU3bN7fAnMds%3D"],"PurchaseURL":["https://www.amazon.com/gp/cart/aws-merge.html?cart-id=182-3610389-1151221%26associate-id=bubboorev-20%26hmac=ao4WghbjnDwYstiGU3bN7fAnMds%3D%26SubscriptionId=AKIAILD2WZTCJPBMK66A%26MergeCart=False"],"SubTotal":[{"Amount":["1201"],"CurrencyCode":["USD"],"FormattedPrice":["$12.01"]}],"CartItems":[{"SubTotal":[{"Amount":["1201"],"CurrencyCode":["USD"],"FormattedPrice":["$12.01"]}],"CartItem":[{"CartItemId":["C3KBVCVTT4SOOJ"],"ASIN":["B0060E6CVG"],"SellerNickname":["Amazon.com"],"Quantity":["1"],"Title":["Perfect Point RC-1793B Throwing Knife Set with Three Knives, Black Blades, Steel Handles, 8-Inch Overall"],"ProductGroup":["Sports"],"Price":[{"Amount":["1201"],"CurrencyCode":["USD"],"FormattedPrice":["$12.01"]}],"ItemTotal":[{"Amount":["1201"],"CurrencyCode":["USD"],"FormattedPrice":["$12.01"]}]}]}]}
  */
  db.items.find({
    team: team_id,
    purchased: false,
    deleted: false
  }).exec(function(e, items) {
    if (e) { return cb(e) }
    // get cart from amazon.com somehow


    // Create the actual cart
    var cart = {
      team: team_id,
      individual_items: items,

      // amazon stuff
      amazon: amazon
    };

    // var aggregated_items = amazon.CartItems.CartItem.reduce(function(hash, i) {
    //   if (typeof hash[i.ASIN] === 'undefined') {
    //     // make sure there is a price
    //     if (typeof i.Price === 'undefined' || typeof i.Price[0] === 'undefined') {
    //       console.log('No price for item in amazon cart.  probably an error.  TODO')
    //       i.Price = [{FormattedPrice: ''}]
    //     }
    //
    //     hash[i.ASIN] = {
    //       ASIN: i.ASIN,
    //       title: i.Title,
    //       price: i.Price[0].FormattedPrice,
    //
    //       // stuff we will get from mongo db
    //       quantity: 0,
    //       added_by: []
    //     };
    //   }
    //
    //   return hash;
    //
    // }, {})

    var aggregated_items = items.reduce(function(hash, i) {
      if (typeof hash[i.ASIN] === 'undefined') {
        hash[i.ASIN] = _.merge({}, i, {
          quantity: 0,
          added_by: []
        })
      }

      hash[i.ASIN].quantity++;
      hash[i.ASIN].added_by.push(i.added_by)

      return hash;
    })

    cart.items = items;

    cb(null, items);


  })
}

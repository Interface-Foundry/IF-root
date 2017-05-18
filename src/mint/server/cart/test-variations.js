var amazon = require('./amazon_cart')
const co = require('co')
var asins = {
  laptop: 'B01L8PDMOG'
}
co(function * () {
  var res = yield amazon.lookupAmazonItem(asins.laptop, 'US')
  // if (res.Item.ParentASIN && res.Item.ParentASIN !== res.Item.ASIN) {
  //   res = yield amazon.lookupAmazonItem(res.Item.ParentASIN)
  // }
  console.log(Object.keys(res.Item))
  debugger

  console.log(JSON.stringify(res, null, 2))
}).catch(console.error.bind(console))

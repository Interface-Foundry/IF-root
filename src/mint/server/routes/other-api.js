const co = require('co')
var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const deals = require('../deals/deals')

module.exports = function (router) {
  /**
   * @api {get} /api/error Error
   * @apiDescription Trigger an error for testing
   * @apiGroup Other
   */
  router.get('/error', (req, res) => co(function * () {
    console.log('gonna throw an error now')
    throw new Error('omg error')
  }))

  /**
   * @api {get} /api/email/:email_id.png Email Tracker
   * @apiDescription Sends a 1x1 pixel image back to track when a user opens an email.
   * @apiGroup Other
   * @apiParam {string} :email_id the id of the user (remember to add .png to it)
   * @apiParamExample Request
   * get https://mint.kipthis.com/api/email/53b5e701-5282-4efd-953c-082bc29a329c.png
   *
   * @type {Image}
   */
  router.get('/email/:email_id', (req, res) => co(function * () {
    res.sendfile(__dirname + '/one-pixel.png')

    const email_id = req.params.email_id.replace(/.png$/, '')
    var open = db.EmailOpens.create({
      email: email_id
    })

    yield open.save()
  }))

  /**
   * @api {get} /api/deals Deals
   * @apiDescription Sends a list of daily deals
   * @apiGroup Other
   * @apiParam {integer} count the number of deals to return (default 10)
   * @apiParam {integer} skip the number of deals to skip when paging (default 0)
   * @apiParamExample Request
   * GET https://mint.kipthis.com/api/deals?count=5&skip=5
   *
   * @apiSuccessExample Response
   * [{"original_name":"North States Superyard 3-in-1 Metal Gate","name":"North States Superyard 3-in-1 Metal Gate ","asin":"B000U5FOT2","price":99.87,"previousPrice":114.06,"category":"Baby Product","small":"https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL._SL75_.jpg","medium":"https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL._SL160_.jpg","large":"https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL.jpg","url":"https://www.amazon.com/North-States-Superyard-Metal-Gate/dp/B000U5FOT2?psc=1&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B000U5FOT2","savePercent":0.12,"active":true,"createdAt":"2017-03-31T18:12:46.678Z","updatedAt":"2017-03-31T18:12:46.717Z","id":"58de9c1ee014862c201e3061"},{"original_name":"ALEX Toys Craft My First Sewing Kit","name":"ALEX Toys Craft My First Sewing Kit ","asin":"B000F3V2MW","price":35,"previousPrice":15.03,"category":"Toy","small":"https://images-na.ssl-images-amazon.com/images/I/51HuKmXCIxL._SL75_.jpg","medium":"https://images-na.ssl-images-amazon.com/images/I/51HuKmXCIxL._SL160_.jpg","large":"https://images-na.ssl-images-amazon.com/images/I/51HuKmXCIxL.jpg","url":"https://www.amazon.com/ALEX-Toys-Craft-First-Sewing/dp/B000F3V2MW?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B000F3V2MW","savePercent":-1.33,"active":true,"createdAt":"2017-03-31T18:12:48.737Z","updatedAt":"2017-03-31T18:12:48.787Z","id":"58de9c20e014862c201e3080"},{"original_name":"Cuisinart MCP117-16BR MultiClad Pro Stain ... ess 16-Inch Rectangular Roaster with Rack","name":"Cuisinart MCP117-16BR MultiClad Pro 16-Inch Rectangular Roaster with Rack ","asin":"B0041Q409G","price":179.95,"previousPrice":66.58,"category":"Kitchen","small":"https://images-na.ssl-images-amazon.com/images/I/419YXeE00OL._SL75_.jpg","medium":"https://images-na.ssl-images-amazon.com/images/I/419YXeE00OL._SL160_.jpg","large":"https://images-na.ssl-images-amazon.com/images/I/419YXeE00OL.jpg","url":"https://www.amazon.com/Cuisinart-MCP117-16BR-MultiClad-Stainless-Rectangular/dp/B0041Q409G?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B0041Q409G","savePercent":-1.7,"active":true,"createdAt":"2017-03-31T18:12:50.865Z","updatedAt":"2017-03-31T18:12:50.915Z","id":"58de9c22e014862c201e309f"},{"original_name":"Cuisinart CTG-00-SMB Stainless Steel Mixing Bowls with Lids,  Set of 3","name":"Cuisinart CTG-00-SMB Stainless Steel Mixing Bowls with Lids ","asin":"B004YZEO9K","price":22.19,"previousPrice":25.72,"category":"Kitchen","small":"https://images-na.ssl-images-amazon.com/images/I/31HRoRgAsqL._SL75_.jpg","medium":"https://images-na.ssl-images-amazon.com/images/I/31HRoRgAsqL._SL160_.jpg","large":"https://images-na.ssl-images-amazon.com/images/I/31HRoRgAsqL.jpg","url":"https://www.amazon.com/Cuisinart-CTG-00-SMB-Stainless-Steel-Mixing/dp/B004YZEO9K?SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B004YZEO9K","savePercent":0.14,"active":true,"createdAt":"2017-03-31T18:12:52.934Z","updatedAt":"2017-03-31T18:12:52.983Z","id":"58de9c24e014862c201e30be"},{"original_name":"Fitbit One Wireless Activity Plus Sleep Tracker,  Black","name":"Fitbit One Wireless Activity Plus Sleep Tracker ","asin":"B0095PZHPE","price":99.95,"previousPrice":96.32,"category":"Health and Beauty","small":"https://images-na.ssl-images-amazon.com/images/I/31cJZdMlStL._SL75_.jpg","medium":"https://images-na.ssl-images-amazon.com/images/I/31cJZdMlStL._SL160_.jpg","large":"https://images-na.ssl-images-amazon.com/images/I/31cJZdMlStL.jpg","url":"https://www.amazon.com/Fitbit-Wireless-Activity-Sleep-Tracker/dp/B0095PZHPE?psc=1&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B0095PZHPE","savePercent":-0.04,"active":true,"createdAt":"2017-03-31T18:12:55.016Z","updatedAt":"2017-03-31T18:12:55.071Z","id":"58de9c27e014862c201e30dd"}]
   */
  router.get('/deals', (req, res) => co(function * () {
    const count = req.query.count || 10
    const skip = req.query.skip || 0

    const todaysDeals = yield deals.getDeals(count, skip)
    res.send(todaysDeals)
  }))
}

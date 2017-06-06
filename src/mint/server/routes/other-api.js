const co = require('co')
const request = require('request-promise')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const constants = require('../constants.js')
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

  /**
   * @api {put} /api/unsubscribe
   * @apiDescription Unsubscribes the user in the qs from the unsubscribe group in the qs
   * @apiGroup Other
   * @apiParam {string} user_id -- id of the user we want to unsubscribe from our content
   * @apiParam {number} group_id -- id of the suppression group to add the user to
   * @apiParamExample Request
   * PUT http://localhost:3000/api/unsubscribe?user_id=c62f58e0-5000-47f8-addd-eb1ffd6df464&group_id=2321
   * @apiSuccessExample Response
   * OK
   */

  router.put('/unsubscribe', (req, res) => co(function * () {
    yield dbReady;

    var user = yield db.UserAccounts.findOne({id: req.query.user_id});

    request({
      method: 'POST',
      uri: `https://sendgrid.com/v3/asm/groups/${req.query.group_id}/suppressions`,
      headers: {
        'AUTHORIZATION': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: {
        'recipient_emails': [user.email_address]
      },
      json: true
    })
    .then(function (result) {
      res.sendStatus(200);
    })
    .catch(function (err) {
      console.log('error:', err)
    })
  }))

  /**
   * @api {get} /api/subscription/:user
   * @apiDescription Gets a list of unsubscribe-groups the user is unsubscribed from
   * @apiGroup Other
   * @apiParam {string} id of the user we're querying about
   * @apiParamExample Request
   * GET https://mint.kipthis.com/api/subscription/c62f58e0-5000-47f8-addd-eb1ffd6df464
   * @apiSuccessExample Response
   * [{"id":2273,"name":"Cart Updates","description":"Weekly updates on the status of your Kip cart"}]
   */

   router.get('/subscription/:user_id', (req, res) => co(function * () {
     yield dbReady;
     var user = yield db.UserAccounts.findOne({id: req.params.user_id});
     if (!user) throw new Error('Error finding user');

     var email = user.email_address;
     console.log('EMAIL', email);

     var suppressions = yield request({
       method: 'GET',
       uri: 'https://sendgrid.com/v3/asm/suppressions/' + email,
       headers: {
         'AUTHORIZATION': 'Bearer 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',
         'Content-Type': 'application/json'
       },
       json: true
     })

    //  console.log('SUPPRESSIONS', suppressions);
     suppressions = suppressions.suppressions.filter(sup => sup.suppressed);
     suppressions = suppressions.map(function (sup) {
       return {id: sup.id, name: sup.name, description: sup.description};
     });

     res.send(suppressions)
   }))


  /**
   * @api {Get} /api/postcode/:code looks up a list of addresses associated with a british postal code
   * @apiGroup Other
   * @apiParam {string} code the postal code we want addresses for
   * examples: https://www.pcapredict.com/support/webservice/postcodeanywhere/interactive/retrievebyid/1.3/
   */
  router.get('/postcode', (req, res) => co(function * () {
    var code = req.query.code;
    var pcaFindResult = yield request(`https://services.postcodeanywhere.co.uk/PostcodeAnywhere/Interactive/Find/v1.10/json.ws?Key=UX83-MY94-GN78-FN27&Filter=None&SearchTerm=${code}`);
    // logging.info('pcaFind result', pcaFindResult)

    var addresses = yield JSON.parse(pcaFindResult).map(function * (item) {
      var fullAddress = yield request(`https://services.postcodeanywhere.co.uk/PostcodeAnywhere/Interactive/RetrieveById/v1.30/json.ws?Key=UX83-MY94-GN78-FN27&Id=${item.Id}`);
      // logging.info('full address:', fullAddress);
      return JSON.parse(fullAddress)
    });

    res.send(addresses);
  }));


  /*
   * Gets all themes
   * @api {Get} /api/themes Gets all themes in the db
   * @apiGroup Other
   */
  router.get('/themes', (req, res) => co(function * () {
    var themes = yield db.Themes.find({});
    res.send(themes);
  }))
}

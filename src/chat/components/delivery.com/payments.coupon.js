require('../../../db')
var _ = require('lodash')

// hardcoded kip service fee lol
const serviceFee = 99

// teams removed so far: 'T3AM3RZSL' - vegan house
var couponTeams = [{
  'couponDiscount': 0.99,
  'teams': [
    'T2X0BLHGX', // alyx testing team
    'T02PN3B25', // kipsearch team
    'T02QUPKHW', // quibb team
    'T1198BQV8', // message.io team
    'T3AHPU2N9', // eden tester
    'T3BCG4CP4', // woodside friends
    'T3AN3CDJ5', // Berkshire Inc.
    // phase 2 teams
    'T024F5PNW', // Betaworks
    'T2U751DHD', // Marketing605
    'T3BCWK9MG', // Tawa
    'T3BBJ9Y2F', // Reel Memoriez Photography
    'T22RW4CUR', // New School Anime Club
    'T1A2KS6KH' // TOPBOTS
  ]
}, {
  'couponDiscount': 0.33,
  'teams': [
    'T167QHT5M',
    'TEST_ING'
  ]
}]

/* calculate the amount that coupon results in
* @param (Number) total
* @param (Number) coupon percintage as decimal
* @returns (Number) new total amount
*/
function calCoupon (total, couponDiscount) {
  var s = total * couponDiscount
  var t = total - s
  // to reach minimum stripe charge of $0.50
  if (t < 0.50) t = 0.50
  return t
}

/* get coupon if its available for team
*
*
*/
function * getCoupon (body) {
  var slackbot = yield db.Slackbots.findOne({team_id: body.team_id}).exec()

  var discountAvail = _.find(couponTeams, function (obj) {
    return _.includes(obj.teams, body.team_id)
  })
  // COUPONS
  if (!_.get(slackbot, 'meta.used_coupons')) {
    slackbot.meta.used_coupons = 0
    yield slackbot.save()
  }
  if (discountAvail) {
    body.order.coupon = discountAvail.couponDiscount
    slackbot.meta.used_coupons++
    yield slackbot.save()
  }

  if (_.get(slackbot, 'meta.used_coupons') >= 5) {
    body.order.coupon = 0.50
  }

  return body
}

module.exports.calCoupon = calCoupon
module.exports.couponTeams = couponTeams
module.exports.getCoupon = getCoupon
module.exports.serviceFee = serviceFee

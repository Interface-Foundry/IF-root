require('../kip')
var _ = require('lodash')

function * getCoupon (body) {
  var slackbot = yield db.Slackbots.findOne({team_id: body.team_id}).exec()

  // COUPONS
  if (body.team_id === 'T2X0BLHGX') { // alyx testing team
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T02PN3B25') { // kipsearch team
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T02QUPKHW') { // quibb team
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T1198BQV8') { // message.io team
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3AHPU2N9') { // eden tester
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3BCG4CP4') { // woodside friends
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3AM3RZSL') { // vegan house
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3AN3CDJ5') { // Berkshire Inc.
  // -------------------- phase 2 teams --------------------
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T024F5PNW') { // Betaworks
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T2U751DHD') { // Marketing605
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3BCWK9MG') { // Tawa
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T3BBJ9Y2F') { // Reel Memoriez Photography
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T22RW4CUR') { // New School Anime Club
    body.order.coupon = 0.99 // in percentage off
  } else if (body.team_id === 'T1A2KS6KH') { // TOPBOTS
    body.order.coupon = 0.99 // in percentage off
  }

  if (_.get(slackbot, 'meta.used_coupons') <= 5) {
    body.order.coupon = 0.50
    slackbot.meta.used_coupons++
    yield slackbot.save()
  }

  return body
}

module.exports.getCoupon = getCoupon
